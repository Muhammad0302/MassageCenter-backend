const validator = require("validator");
const ReviewRatingMasseuse = require("../models/ReviewRatingMasseuse");
const UserActivity = require("../models/UserActivity");
const User = require("../models/User");
const { parse } = require("path");

exports.allReviewRatingMasseuse = (req, res, next) => {
  ReviewRatingMasseuse.findAll({ where: { isDeleted: 0 } })
    .then((masseuse) => {
      res.status(200).send({
        success: true,
        message: "ReviewRatingMasseuse fetched successfully",
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

exports.singleReviewRatingMasseuse = (req, res, next) => {
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
    ReviewRatingMasseuse.findAll({
      where: { masseuseId: id, isDeleted: 0 },
      include: [{ model: User, attributes: ["userName"] }],
    })
      .then((masseuse) => {
        if (masseuse) {
          res.status(200).send({
            success: true,
            message: "ReviewRatingMasseuse fetched successfully",
            data: masseuse,
          });
        } else {
          res.status(400).send({
            success: false,
            message: "ReviewRatingMasseuse doesnt exists",
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

// exports.singleReviewRatingMasseuse = (req, res, next) => {
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
//     ReviewRatingMasseuse.findAndCountAll({
//       limit: size,
//       offset: page * size,
//       where: { masseuseId: id, isDeleted: 0 },
//       include: [{ model: User, attributes: ["email"] }],
//     })
//       .then((masseuse) => {
//         if (masseuse) {
//           res.status(200).send({
//             success: true,
//             message: "ReviewRatingMasseuse fetched successfully",
//             data: masseuse.rows,
//             totalPages: Math.ceil(masseuse.count / size),
//           });
//         } else {
//           res.status(400).send({
//             success: false,
//             message: "ReviewRatingMasseuse doesnt exists",
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
exports.removeReviewRatingMasseuse = (req, res, next) => {
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
    ReviewRatingMasseuse.findOne({ where: { id } })
      .then((masseuse) => {
        if (masseuse) {
          masseuse
            .update({ isDeleted: 1 })
            .then((result) => {
              res.status(200).send({
                success: true,
                message: "ReviewRatingMasseuse deleted successfully",
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
            message: "ReviewRatingMasseuse doesnt exists",
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
exports.addReviewRatingMasseuse = (req, res, next) => {
  const validationErrors = [];
  //console.log()
  const userId = req.user;
  console.log("User Id is ", userId);
  const { review, rating, masseuseId } = req.body;
  if (validator.isEmpty(masseuseId)) {
    validationErrors.push("masseuseId is required.");
  }
  if (validator.isEmpty(review)) {
    validationErrors.push("review is required.");
  }
  if (validator.isEmpty(rating)) {
    validationErrors.push("rating is required.");
  }
  if (validationErrors.length) {
    res.status(400).send({
      success: false,
      message: "Issue with data being send",
      data: validationErrors,
    });
  } else {
    ReviewRatingMasseuse.create({
      review,
      rating,
      userId,
      masseuseId,
      isDeleted: 0,
    })
      .then((masseuse) => {
        if (masseuse) {
          let newObj = {
            id: masseuse.id,
            review: masseuse.review,
            rating: masseuse.rating,
            masseuseId: masseuse.masseuseId,
          };
          console.log("new Object is");
          console.log(newObj);

          UserActivity.create({
            actiontype: "rating",
            metadata: newObj,
            userId,
          })
            .then((response) => {
              console.log("User Activity is ");
              console.log(masseuse);
              res.status(200).send({
                success: true,
                message: "ReviewRatingMasseuse UserActivity added successfully",
                data: [masseuse, response],
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
exports.updateReviewRatingMasseuse = (req, res, nexxt) => {
  const { review, rating, userId, masseuseId } = req.body;
  const { id } = req.params;
  if (id) {
    ReviewRatingMasseuse.findOne({
      where: {
        id,
        isDeleted: 0,
      },
    })
      .then((masseuse) => {
        if (masseuse) {
          masseuse
            .update({
              review: review ? review : masseuse.review,
              rating: rating ? rating : masseuse.rating,
              userId: userId ? userId : masseuse.userId,
              masseuseId: masseuseId ? masseuseId : masseuse.masseuseId,
            })
            .then((data) => {
              res.status(200).send({
                success: true,
                message: "ReviewRatingMasseuse updated successfully =)",
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
            message: "ReviewRatingMasseuse not found",
          });
        }
      })
      .catch((err) => console.log(err));
  } else {
    res.status(400).send({
      success: false,
      message: "Id of ReviewRatingMasseuse is required",
    });
  }
};
