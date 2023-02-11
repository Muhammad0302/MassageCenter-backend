const validator = require("validator");
const SpaComment = require("../models/SpaComment");
const UserActivity = require("../models/UserActivity");
const Forum = require("../models/Forums");
const elasticSearch = require("../helpher/elasticsearch");
const Comment = require("../models/Comments");

const User = require("../models/User");
exports.allSpaComment = (req, res, next) => {
  Comment.findAll({ where: { isDeleted: 0 } })
    .then((masseuse) => {
      res.status(200).send({
        success: true,
        message: "SpaComment fetched successfully",
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
exports.singleSpaComment = async (req, res, next) => {
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
          include: [{ model: User, attributes: ["userName"] }],
        },
      ],
    })
      .then((masseuse) => {
        if (masseuse) {
          res.status(200).send({
            success: true,
            message: "SpaComment fetched successfully",
            data: masseuse,
          });
        } else {
          res.status(400).send({
            success: false,
            message: "SpaComment doesnt exists",
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
exports.removeSpaComment = (req, res, next) => {
  console.log("ID we are here");
  const { id } = req.params;
  const { forumId, elasticID } = req.params;
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
      .then(async (masseuse) => {
        if (masseuse) {
          let forum = await Forum.findOne({
            where: {
              id: forumId,
            },
          });
          if (forum) {
            let updated_forum = await forum.update({
              no_comments: forum.no_comments - 1,
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

          await elasticSearch.updateForum(
            `${elasticID}_${forum.id}`,
            forum,
            (forum = [])
          );

          res.status(200).send({
            success: true,
            message: "SpaComment deleted successfully",
          });

          // masseuse
          //   .update({ isDeleted: 1 })
          //   .then((result) => {
          //     res.status(200).send({
          //       success: true,
          //       message: "SpaComment deleted successfully",
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
            message: "SpaComment doesnt exists",
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
exports.addSpaComment = (req, res, next) => {
  console.log("ADD SPA COMMENT: ", req.body);

  var userId = req.user;
  console.log("userId: ", userId);

  const validationErrors = [];
  const { comment, mediaLink, parentId, forumId, elasticID } = req.body;
  // if (validator.isEmpty(userId)) {
  // 	validationErrors.push('userId is required.');
  // }
  // if (validator.isEmpty(spaId)) {
  // 	validationErrors.push('spaId is required.');
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
      .then(async (spaComment) => {
        if (spaComment) {
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
          let sfComment = [];
          await elasticSearch.updateForum(
            `${elasticID}_${forum.id}`,
            forum,
            sfComment
          );
          let newObj = {
            id: spaComment.id,
            mediaLink: spaComment.mediaLink,
            comment: spaComment.comment,
            forumId: spaComment.forumId,
            forumIdtype: "Search in SpaForm ID ",
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
              //console.log(response);
              res.status(200).send({
                success: true,
                message: "ReviewRatingMasseuse UserActivity added successfully",
                data: [spaComment, response],
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
        res.status(400).send({
          success: false,
          message: `Something went wrong ${err}`,
        });
      });
  }
};
exports.updateSpaComment = (req, res, nexxt) => {
  const { comment, mediaLink, parentId, userId, forumId } = req.body;
  const { id } = req.params;
  console.log("ID IS SSS ", id);
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
                forumId: forumId ? forumId : masseuse.forumId,
                userId: userId ? userId : masseuse.userId,
              },
              {
                where: {
                  id: masseuse.id,
                },
              }
            )
            .then((data) => {
              res.status(200).send({
                success: true,
                message: "SpaComment updated successfully =)",
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
            message: "SpaComment not found",
          });
        }
      })
      .catch((err) => console.log(err));
  } else {
    res.status(400).send({
      success: false,
      message: "Id of SpaComment is required",
    });
  }
};
