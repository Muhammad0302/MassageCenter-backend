const validator = require("validator");
const SpaForum = require("../models/SpaForum");
const SpaComment = require("../models/SpaComment");
const Comment = require("../models/Comments");
const Forum = require("../models/Forums");
const { Sequelize } = require("sequelize");
const Op = Sequelize.Op;
const elasticSearch = require("../helpher/elasticsearch");
const User = require("../models/User");

exports.allSpaForum = (req, res, next) => {
  Forum.findAll({
    where: {
      isDeleted: 0,
      spaId: {
        [Op.ne]: null,
      },
    },

    include: [
      {
        model: Comment,
        as: "comments",

        // attributes: [[Sequelize.fn("COUNT", "forumId"), "items"]],
        include: [
          {
            model: User,
            attributes: ["userName"],
          },
          {
            model: Comment,
            as: "Replies",
            include: { model: User, attributes: ["userName"] },
          },
        ],
        //include: { model: User, attributes: ["userName"] },
      },
    ],
    order: [["no_comments", "DESC"]],
  })
    .then((masseuse) => {
      res.status(200).send({
        success: true,
        message: "SpaForum fetched successfully",
        data: masseuse,
      });
    })
    .catch((err) => {
      console.log("ERRROR is ", err);
      res.status(400).send({
        success: false,
        message: `issue fetching data ${err}`,
        err,
      });
    });
};

// exports.allSpaForum = (req, res, next) => {
//   const pageAsNumber = Number.parseInt(req.query.page);
//   const sizeAsNumber = Number.parseInt(req.query.size);
//   console.log(req.query.page);
//   console.log(req.query.size);
//   let page = 0;
//   if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
//     page = pageAsNumber;
//   }
//   let size = 10;
//   if (!Number.isNaN(sizeAsNumber) && sizeAsNumber > 0 && sizeAsNumber < 10) {
//     size = sizeAsNumber;
//   }
//   SpaForum.findAndCountAll({
//     limit: size,
//     offset: page * size,
//     where: { isDeleted: 0 },
//     include: [
//       { model: SpaComment, include: [{ model: SpaComment, as: "Replies" }] },
//     ],
//   })
//     .then((masseuse) => {
//       res.status(200).send({
//         success: true,
//         message: "SpaForum fetched successfully",
//         data: masseuse.rows,
//         totalPages: Math.ceil(masseuse.count / size),
//       });
//     })
//     .catch((err) => {
//       res.status(400).send({
//         success: false,
//         message: `issue fetching data ${err}`,
//       });
//     });
// };

// exports.singleSpaForum = (req, res, next) => {
//   const pageAsNumber = Number.parseInt(req.query.page);
//   const sizeAsNumber = Number.parseInt(req.query.size);
//   console.log(req.query.page);
//   console.log(req.query.size);
//   let page = 0;
//   if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
//     page = pageAsNumber;
//   }
//   let size = 10;
//   if (!Number.isNaN(sizeAsNumber) && sizeAsNumber > 0 && sizeAsNumber < 10) {
//     size = sizeAsNumber;
//   }
//   const { id } = req.params;
//   const validationErrors = [];
//   if (validator.isEmpty(id)) {
//     validationErrors.push("Id is required.");
//   }
//   if (validationErrors.length) {
//     res.status(400).send({
//       success: false,
//       message: "Issue with data being send",
//       data: validationErrors,
//     });
//   } else {
//     SpaForum.findAndCountAll({
//       limit: size,
//       offset: page * size,
//       where: { spaId: id, isDeleted: 0 },
//       include: [
//         { model: SpaComment, include: [{ model: SpaComment, as: "Replies" }] },
//       ],
//     })
//       .then((masseuse) => {
//         if (masseuse) {
//           res.status(200).send({
//             success: true,
//             message: "SpaForum fetched successfully",
//             data: masseuse.rows,
//             totalPages: Math.ceil(masseuse.count / size),
//           });
//         } else {
//           res.status(400).send({
//             success: false,
//             message: "SpaForum doesnt exists",
//           });
//         }
//       })
//       .catch((err) => {
//         res.status(400).send({
//           success: false,
//           message: `issue fetching data ${err}`,
//         });
//       });
//   }
// };

exports.elasticForumViewUpdate = async (req, res, next) => {
  try {
    const forumId = req.params.id;
    const elasticID = req.params.type;
    console.log("Elastic type is ", elasticID);
    let forum = await Forum.findOne({
      where: {
        id: forumId,
      },
    });
    if (forum) {
      forum
        .update({
          views: parseInt(forum.views + 1),
        })
        .then(async (masseuse) => {
          if (masseuse) {
            let comments = [];
            let forumtype = elasticID;

            await elasticSearch.addForum(`${elasticID}_${masseuse.id}`, {
              masseuse,
              comments,
              forumtype,
            });

            return res.status(200).send({
              message: "Updated views are ",
              masseuse,
              success: true,
            });
          } else {
            return res.status(200).send({
              success: false,
              message: "Error in view update",
            });
          }
        })
        .catch((error) => {
          return res.status(200).send({
            success: false,
            message: "Error in view update",
          });
        });
    }
  } catch (err) {
    console.log("Error", err);
    res.status(503).send({ success: false, message: "Server Error" });
  }
};

exports.singleSpaForum = async (req, res, next) => {
  const { id, forumId, elasticID } = req.params;
  const validationErrors = [];
  if (validator.isEmpty(id)) {
    validationErrors.push("Id is required.");
  }
  if (validationErrors.length) {
    res.status(400).send({
      success: false,
      message: "Issue with data being send",
      data: validationErrors,
    });
  } else {
    const SpaForumCountExist = await Forum.findOne({
      where: { id: forumId, isDeleted: 0 },
    });
    if (SpaForumCountExist) {
      SpaForumCountExist.update({
        views: parseInt(SpaForumCountExist.views + 1),
      });

      let forumtype = elasticID;
      let comments = [];

      console.log("SpaForumCountExist is ", SpaForumCountExist);
      // await elasticSearch.addForum(`${elasticID}_${masseuse.id}`, {
      //   masseuse,
      //   comments,
      //   forumtype,
      // });
    }
    Forum.findAll({
      where: { spaId: id, isDeleted: 0 },
      include: [
        { model: Comment, include: [{ model: Comment, as: "Replies" }] },
      ],
    })
      .then((masseuse) => {
        if (masseuse) {
          res.status(200).send({
            success: true,
            message: "SpaForum fetched successfully",
            data: masseuse,
            SpaForumCountExist,
          });
        } else {
          res.status(400).send({
            success: false,
            message: "SpaForum doesnt exists",
          });
        }
      })
      .catch((err) => {
        res.status(400).send({
          success: false,
          message: `issue fetching data ${err}`,
        });
      });
  }
};

exports.removeSpaForum = (req, res, next) => {
  const { id } = req.params;
  const { elasticID } = req.params;
  // console.log("Request body is ", req.body);
  console.log("Elastic id is ", elasticID);
  const validationErrors = [];
  if (validator.isEmpty(id)) {
    validationErrors.push("Id is required.");
  }
  if (validationErrors.length) {
    res.status(400).send({
      success: false,
      message: "Issue with data being send",
      data: validationErrors,
    });
  } else {
    Forum.findOne({ where: { id } })
      .then((masseuse) => {
        if (masseuse) {
          masseuse
            .update({ isDeleted: 1 })
            .then(async (result) => {
              let data = await elasticSearch.deleteForum(`${elasticID}_${id}`);
              console.log("Result is ", data);
              res.status(200).send({
                success: true,
                message: "SpaForum deleted",
                data,
              });
            })
            .catch((err) => {
              res.status(400).send({
                success: false,
                message: `Something went worng ${err}`,
              });
            });
        } else {
          res.status(400).send({
            success: false,
            message: "SpaForum doesnt exists",
          });
        }
      })
      .catch((err) => {
        res.status(400).send({
          success: false,
          message: `Something went worng ${err}`,
        });
      });
  }
};
exports.addSpaForum = (req, res, next) => {
  const validationErrors = [];
  const { topic, userId, spaId, description, comments, elasticID, masseuseId } =
    req.body;
  // if (validator.isEmpty(userId)) {
  // 	validationErrors.push('userId is required.');
  // }
  // if (validator.isEmpty(spaId)) {
  // 	validationErrors.push('spaId is required.');
  // }
  // if (validator.isEmpty(topic)) {
  // 	validationErrors.push('topic is required.');
  // }

  if (validationErrors.length) {
    res.status(400).send({
      success: false,
      message: "Issue with data being send",
      data: validationErrors,
    });
  } else {
    Forum.create({
      topic,
      userId,
      spaId,
      masseuseId,
      description,
      isDeleted: 0,
    })
      .then(async (masseuse) => {
        let forumtype = elasticID;
        await elasticSearch.addForum(`${elasticID}_${masseuse.id}`, {
          masseuse,
          comments,
          forumtype,
        });
        res.status(200).send({
          success: true,
          message: "SpaForum added successfully",
          data: masseuse,
        });
      })
      .catch((err) => {
        res.status(400).send({
          success: false,
          message: `Something went wrong ${err}`,
        });
      });
  }
};
exports.updateSpaForum = (req, res, nexxt) => {
  const { topic, userId, spaId, description, comments, elasticID } = req.body;
  const { id } = req.params;
  if (id) {
    Forum.findOne({
      where: {
        id,
        isDeleted: 0,
      },
    })
      .then((masseuse) => {
        if (masseuse) {
          masseuse
            .update({
              topic: topic ? topic : masseuse.topic,
              spaId: spaId ? spaId : masseuse.spaId,
              userId: userId ? userId : masseuse.userId,
              description: description ? description : masseuse.description,
            })
            .then(async (data) => {
              await elasticSearch.addForum(`${elasticID}_${id}`, {
                masseuse,
                comments,
              });
              res.status(200).send({
                success: true,
                message: "SpaForum updated successfully =)",
                data: data,
              });
            })
            .catch((err) => {
              res.status(400).send({
                success: false,
                message: err,
              });
            });
        } else {
          res.status(400).send({
            success: false,
            message: "SpaForum not found",
          });
        }
      })
      .catch((err) => console.log(err));
  } else {
    res.status(400).send({
      success: false,
      message: "Id of SpaForum is required",
    });
  }
};
