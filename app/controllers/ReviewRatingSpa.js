const validator = require("validator");
const ReviewRatingSpa = require("../models/ReviewRatingSpa");
const User = require("../models/User");
const UserActivity = require("../models/UserActivity");

exports.allReviewRatingSpa = (req, res, next) => {
  ReviewRatingSpa.findAll({ where: { isDeleted: 0 } })
    .then((masseuse) => {
      res.status(200).send({
        success: true,
        message: "ReviewRatingSpa fetched successfully",
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

// exports.singleReviewRatingSpa = (req, res, next) => {
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
//     ReviewRatingSpa.findAndCountAll({
//       limit: size,
//       offset: page * size,
//       where: { spaId: id, isDeleted: 0 },
//       include: [{ model: User, attributes: ["email"] }],
//     })
//       .then((masseuse) => {
//         if (masseuse) {
//           res.status(200).send({
//             success: true,
//             message: "ReviewRatingSpa fetched successfully",
//             data: masseuse.rows,
//             totalPages: Math.ceil(masseuse.count / size),
//           });
//         } else {
//           res.status(400).send({
//             success: false,
//             message: "ReviewRatingSpa doesnt exists",
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

exports.singleReviewRatingSpa = (req, res, next) => {
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
    ReviewRatingSpa.findAll({
      where: { spaId: id, isDeleted: 0 },
      include: [{ model: User, attributes: ["userName"] }],
    })
      .then((masseuse) => {
        if (masseuse) {
          res.status(200).send({
            success: true,
            message: "ReviewRatingSpa fetched successfully",
            data: masseuse,
          });
        } else {
          res.status(400).send({
            success: false,
            message: "ReviewRatingSpa doesnt exists",
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

exports.removeReviewRatingSpa = (req, res, next) => {
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
    ReviewRatingSpa.findOne({ where: { id } })
      .then((masseuse) => {
        if (masseuse) {
          masseuse
            .update({ isDeleted: 1 })
            .then((result) => {
              res.status(200).send({
                success: true,
                message: "ReviewRatingSpa deleted successfully",
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
            message: "ReviewRatingSpa doesnt exists",
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
exports.addReviewRatingSpa = (req, res, next) => {
  const validationErrors = [];
  const userId = req.user;
  const { review, rating, spaId } = req.body;
  // if (validator.isEmpty(userId)) {
  // 	validationErrors.push('userId is required.');
  // }
  // if (validator.isEmpty(spaId)) {
  // 	validationErrors.push('spaId is required.');
  // }
  // if (validator.isEmpty(review)) {
  // 	validationErrors.push('review is required.');
  // }
  // if (validator.isEmpty(rating)) {
  // 	validationErrors.push('rating is required.');
  // }
  if (validationErrors.length) {
    res.status(400).send({
      success: false,
      message: "Issue with data being send",
      data: validationErrors,
    });
  } else {
    ReviewRatingSpa.create({
      Review: review,
      Rating: rating,
      userId: userId,
      spaId: spaId,
      isDeleted: 0,
    })
      .then((spa) => {
        if (spa) {
          let newObj = {
            id: spa.id,
            review: spa.Review,
            rating: spa.Rating,
            spaId: spa.spaId,
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
              console.log(spa);
              res.status(200).send({
                success: true,
                message: "ReviewRatingMasseuse UserActivity added successfully",
                data: [spa, response],
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
exports.updateReviewRatingSpa = (req, res, nexxt) => {
  const { review, rating, userId, spaId } = req.body;
  const { id } = req.params;
  if (id) {
    ReviewRatingSpa.findOne({
      where: {
        id,
        isDeleted: 0,
      },
    })
      .then((masseuse) => {
        if (masseuse) {
          masseuse
            .update({
              Review: review ? review : masseuse.review,
              Rating: rating ? rating : masseuse.rating,
              spaId: spaId ? spaId : masseuse.spaId,
              userId: userId ? userId : masseuse.userId,
            })
            .then((data) => {
              res.status(200).send({
                success: true,
                message: "ReviewRatingSpa updated successfully =)",
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
            message: "ReviewRatingSpa not found",
          });
        }
      })
      .catch((err) => console.log(err));
  } else {
    res.status(400).send({
      success: false,
      message: "Id of ReviewRatingSpa is required",
    });
  }
};
