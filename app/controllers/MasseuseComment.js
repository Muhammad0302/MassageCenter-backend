const validator = require("validator");
const MasseuseComment = require("../models/MasseuseComment");
const MasseuseForum = require("../models/MasseuseForum");
const UserActivity = require("../models/UserActivity");
const User = require("../models/User");
const Comment = require("../models/Comments");
const Forum = require("../models/Forums");
const elasticSearch = require("../helpher/elasticsearch");

exports.allMasseuseComment = (req, res, next) => {
  Comment.findAll({ where: { isDeleted: 0 } })
    .then((masseuse) => {
      res.status(200).send({
        success: true,
        message: "Comment fetched successfully",
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
exports.singleMasseuseComment = async (req, res, next) => {
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
    Comment.findAll({
      where: { forumId: id, isDeleted: 0, parentId: null },
      include: [
        { model: User, attributes: ["userName"] },
        {
          model: Comment,
          as: "Replies",
          include: { model: User, attributes: ["userName"] },
        },
      ],
    })
      .then((masseuse) => {
        if (masseuse) {
          res.status(200).send({
            success: true,
            message: "MasseuseComment fetched successfully",
            data: masseuse,
          });
        } else {
          res.status(400).send({
            success: false,
            message: "MasseuseComment doesnt exists",
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
exports.removeMasseuseComment = (req, res, next) => {
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
    Comment.destroy({ where: { id } })
      .then((masseuse) => {
        if (masseuse) {
          res.status(200).send({
            success: true,
            message: "MasseuseComment deleted successfully",
          });

          // masseuse
          //   .update({ isDeleted: 1 })
          //   .then((result) => {
          //     res.status(200).send({
          //       success: true,
          //       message: "MasseuseComment deleted successfully",
          //     });
          //   })
          //   .catch((err) => {
          //     res.status(400).send({
          //       success: false,
          //       message: `Something went worng ${err}`,
          //     });
          //   });
        } else {
          res.status(400).send({
            success: false,
            message: "MasseuseComment doesnt exists",
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
exports.addMasseuseComment = (req, res, next) => {
  console.log("ADD COMMENT");
  const userId = req.user;
  const validationErrors = [];
  const { comment, mediaLink, parentId, forumId, masseuse } = req.body;
  // if (validator.isEmpty(userId)) {
  // 	validationErrors.push('userId is required.');
  // }
  // if (validator.isEmpty(masseuseId)) {
  // 	validationErrors.push('masseuseId is required.');
  // }
  // if (validator.isEmpty(comment)) {
  // 	validationErrors.push('comment is required.');
  // }

  if (validationErrors.length) {
    res.status(400).send({
      success: false,
      message: "Issue with data being send",
      data: validationErrors,
    });
  } else {
    Comment.create({
      comment,
      mediaLink,
      parentId,
      userId,
      forumId,
      isDeleted: 0,
    })
      .then(async (masseuseComment) => {
        if (masseuseComment) {
          let forum = await Forum.findOne({
            where: {
              id: forumId,
            },
          });
          if (forum) {
            let updated_forum = await forum.update({
              no_comments: forum.no_comments + 1,
            });
            if (updated_forum) {
            } else {
              return res.status(200).send({
                success: false,
                message: "Cannot update forum no_comments",
              });
            }
          } else {
            return res.status(200).send({
              success: false,
              message: "Forum not found",
            });
          }

          //await elasticSearch.updateForum("MasseuseForum_", masseuseComment);
          let newObj = {
            id: masseuseComment.id,
            mediaLink: masseuseComment.mediaLink,
            comment: masseuseComment.comment,
            forumId: masseuseComment.forumId,
            forumIdtype: "Search in MasseureForm ID ",
          };
          console.log("new Object is");
          console.log(newObj);

          UserActivity.create({
            actiontype: "comment",
            metadata: newObj,
            userId,
          })
            .then((response) => {
              console.log("User Activity is ");
              console.log(masseuseComment);
              res.status(200).send({
                success: true,
                message: "ReviewRatingMasseuse UserActivity added successfully",
                data: [masseuseComment, response],
              });
            })
            .catch((error) => {
              res.status(400).send({
                success: false,
                message: `Error RatingMasseuse UserActivity  ${error}`,
              });
            });
          //await UserActivity.create
        } else {
          res.status(400).send({
            success: false,
            message: `Error RatingMasseuse  ${error}`,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send({
          success: false,
          message: `Something went wrong ${err}`,
        });
      });
  }
};
exports.updateMasseuseComment = (req, res, nexxt) => {
  console.log("updateMasseuseComment: ", req.body);
  const { comment, mediaLink, parentId, userId, forumId } = req.body;

  const { id } = req.params;
  if (id) {
    Comment.findOne({
      where: {
        id,
        isDeleted: 0,
      },
    })
      .then((masseuse) => {
        if (masseuse) {
          masseuse
            .update(
              {
                comment: comment ? comment : masseuse.comment,
                mediaLink: mediaLink ? mediaLink : masseuse.mediaLink,
                parentId: parentId ? parentId : masseuse.parentId,
                userId: userId ? userId : masseuse.userId,
                forumId: forumId ? forumId : masseuse.forumId,
              }
              // {
              //   where: {
              //     id: masseuse.id,
              //   },
              // }
            )
            .then((data) => {
              res.status(200).send({
                success: true,
                message: "MasseuseComment updated successfully =)",
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
            message: "MasseuseComment not found",
          });
        }
      })
      .catch((err) => console.log(err));
  } else {
    res.status(400).send({
      success: false,
      message: "Id of MasseuseComment is required",
    });
  }
};
exports.singleForumMasseuseComment = (req, res, next) => {
  //const { forumId } = req.body;
  // const forumId = req.params.id;
  const { id } = req.params;
  const forumId = id;
  console.log("ID IS ", id);
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
    Comment.findAll({ where: { forumId, isDeleted: 0 } })
      .then((masseuse) => {
        if (masseuse) {
          res.status(200).send({
            success: true,
            message: "MasseuseComment fetched successfully",
            data: masseuse,
          });
        } else {
          res.status(400).send({
            success: false,
            message: "MasseuseComment doesnt exists",
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
