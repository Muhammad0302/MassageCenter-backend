const validator = require("validator");
const MasseuseForum = require("../models/MasseuseForum");
const MasseuseComment = require("../models/MasseuseComment");
const Comment = require("../models/Comments");
const elasticSearch = require("../helpher/elasticsearch");
const Forum = require("../models/Forums");
const User = require("../models/User");
const { Sequelize } = require("sequelize");
const Op = Sequelize.Op;
exports.allMasseuseForum = (req, res, next) => {
  Forum.findAll({
    where: {
      isDeleted: 0,
      masseuseId: {
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
        message: "MasseuseForum fetched successfully",
        data: masseuse,
      });
    })
    .catch((err) => {
      res.status(400).send({
        success: false,
        message: `issue fetching data ${err}`,
      });
    });
};

// exports.allMasseuseForum = (req, res, next) => {
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

//   MasseuseForum.findAndCountAll({
//     limit: size,
//     offset: page * size,
//     where: { isDeleted: 0 },
//     include: [
//       {
//         model: MasseuseComment,
//         include: [{ model: MasseuseComment, as: "Replies" }],
//       },
//     ],
//   })
//     .then((masseuse) => {
//       res.status(200).send({
//         success: true,
//         message: "MasseuseForum fetched successfully",
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

// exports.singleMasseuseForum = (req, res, next) => {
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
//     MasseuseForum.findAndCountAll({
//       limit: size,
//       offset: page * size,
//       where: { masseuseId: id, isDeleted: 0 },
//       include: [
//         {
//           model: MasseuseComment,
//           include: [{ model: MasseuseComment, as: "Replies" }],
//         },
//       ],
//     })
//       .then((masseuse) => {
//         if (masseuse) {
//           res.status(200).send({
//             success: true,
//             message: "MasseuseForum fetched successfully",
//             data: masseuse.rows,
//             totalPages: Math.ceil(masseuse.count / size),
//           });
//         } else {
//           res.status(400).send({
//             success: false,
//             message: "MasseuseForum doesnt exists",
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

exports.singleMasseuseForum = async (req, res, next) => {
  const { id, forumId } = req.params;
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
    const MasseuseForumExist = await Forum.findOne({
      where: { id: forumId, isDeleted: 0 },
    });
    if (MasseuseForumExist) {
      MasseuseForumExist.update({
        views: parseInt(MasseuseForumExist.views + 1),
      });
    }
    Forum.findAll({
      where: { masseuseId: id, isDeleted: 0 },
      include: [
        {
          model: Comment,
          include: [{ model: Comment, as: "Replies" }],
        },
      ],
    })
      .then(async (masseuse) => {
        if (masseuse) {
          res.status(200).send({
            success: true,
            message: "MasseuseForum fetched successfully",
            data: masseuse,
          });
        } else {
          res.status(400).send({
            success: false,
            message: "MasseuseForum doesnt exists",
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
exports.removeMasseuseForum = (req, res, next) => {
  const { id } = req.params;
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
            .then((result) => {
              res.status(200).send({
                success: true,
                message: "MasseuseForum deleted successfully",
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
            message: "MasseuseForum doesnt exists",
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
exports.addMasseuseForum = (req, res, next) => {
  const validationErrors = [];
  const { topic, userId, masseuseId, description, comments, elasticID } =
    req.body;
  // if (validator.isEmpty(userId)) {
  // 	validationErrors.push('userId is required.');
  // }
  // if (validator.isEmpty(masseuseId)) {
  // 	validationErrors.push('masseuseId is required.');
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
      masseuseId,
      description,
      isDeleted: 0,
    })
      .then(async (masseuse) => {
        //masseuse?.dataValues["comments"] = comments;
        //console.log("comments is ", comments);
        console.log("comments data is ", { masseuse, comments });
        let forumtype = elasticID;
        await elasticSearch.addForum(`${elasticID}_${masseuse.id}`, {
          masseuse,
          comments,
          forumtype,
        });

        res.status(200).send({
          success: true,
          message: "MasseuseForum added successfully",
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
exports.updateMasseuseForum = (req, res, nexxt) => {
  const { topic, userId, masseuseId, description } = req.body;
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
              userId: userId ? userId : masseuse.userId,
              masseuseId: masseuseId ? masseuseId : masseuse.masseuseId,
              description: description ? description : masseuse.description,
            })
            .then((data) => {
              res.status(200).send({
                success: true,
                message: "Masseuse Forum updated successfully =)",
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
            message: "MasseuseForum not found",
          });
        }
      })
      .catch((err) => console.log(err));
  } else {
    res.status(400).send({
      success: false,
      message: "Id of MasseuseForum is required",
    });
  }
};
