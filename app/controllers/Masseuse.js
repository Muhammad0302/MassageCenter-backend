const validator = require("validator");
const Masseuse = require("../models/Masseuse");
const User = require("../models/User");
const ReviewRatingMasseuse = require("../models/ReviewRatingMasseuse");
const spaMessause = require("../models/spaMessause");
const cities = require("../models/cities");
const sequelize = require("../../config/database");
const path = require("path");
const fs = require("fs");
const SpaMasseuse = require("../models/spaMessause");
const elasticSearch = require("../helpher/elasticsearch");
const e = require("express");

/*************** user *************/
// get my Masseuse Including approved and not approved.

exports.getMasseuseByUser = async (req, res, next) => {
  try {
    let userId = req?.user ? req.user : null;
    let id = req.params.id;
    console.log(id, userId);
    if (id) {
      let masseuseData;
      if (id === "all") {
        masseuseData = await Masseuse.findAll({
          where: {
            userId,
            isDeleted: false,
          },
          include: [
            // {
            //   model: cities,
            // },
            {
              model: ReviewRatingMasseuse,
              attributes: ["rating"],
            },
          ],
        });
      } else {
        masseuseData = await Masseuse.findAll({
          where: {
            id,
            userId,
            isDeleted: false,
          },
        });
      }
      //console.log("masseuseData", masseuseData);
      if (masseuseData?.length) {
        res
          .status(200)
          .send({ success: true, message: "data found.", data: masseuseData });
      } else {
        console.log("could not find data.");
        res.status(200).send({ success: false, message: "Data not found." });
      }
    } else {
      console.log("Something is missing.");
      res.status(400).send({ success: false, message: "Send proper Data." });
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Server Error." });
  }
  // Masseuse.findAll({ where: { isDeleted: 0 } })
  // 	.then((masseuse) => {
  // 		res.status(200).send({
  // 			success: true,
  // 			message: 'Masseuse fetched successfully',
  // 			data: masseuse,
  // 		});
  // 	})
  // 	.catch((err) => {
  // 		res.status(400).send({
  // 			success: false,
  // 			message: `issue fetching data ${err}`,
  // 		});
  // 	});
};
exports.getMasseuse = async (req, res, next) => {
  try {
    let userId = req?.user ? req.user : null;
    let id = req.params.id;
    console.log(id, userId);
    if (id) {
      let masseuseData;
      if (id === "all") {
        masseuseData = await Masseuse.findAll({
          where: {
            // userId,
            isDeleted: false,
          },
          include: [
            // {
            //   model: cities,
            // },
            {
              model: ReviewRatingMasseuse,
              attributes: ["rating"],
            },
          ],
        });
      } else {
        masseuseData = await Masseuse.findAll({
          where: {
            id,
            // userId,
            isDeleted: false,
          },
          include: [
            {
              model: spaMessause,
              attributes: ["spaId"],
            },
          ],
        });
        let masseuseDataCounter = await Masseuse.findOne({
          where: {
            id,
            // userId,
            isDeleted: false,
          },
        });
        masseuseDataCounter.update({
          views: parseInt(masseuseDataCounter.views) + 1,
        });
      }
      console.log("masseuseData", masseuseData);
      if (masseuseData?.length) {
        res
          .status(200)
          .send({ success: true, message: "data found.", data: masseuseData });
      } else {
        console.log("could not find data.");
        res.status(200).send({ success: false, message: "Data not found." });
      }
    } else {
      console.log("Something is missing.");
      res.status(400).send({ success: false, message: "Send proper Data." });
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Server Error." });
  }
  // Masseuse.findAll({ where: { isDeleted: 0 } })
  // 	.then((masseuse) => {
  // 		res.status(200).send({
  // 			success: true,
  // 			message: 'Masseuse fetched successfully',
  // 			data: masseuse,
  // 		});
  // 	})
  // 	.catch((err) => {
  // 		res.status(400).send({
  // 			success: false,
  // 			message: `issue fetching data ${err}`,
  // 		});
  // 	});
};
exports.singleMasseuse = (req, res, next) => {
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
    Masseuse.findOne({ where: { id, isDeleted: 0 } })
      .then((masseuse) => {
        if (masseuse) {
          res.status(200).send({
            success: true,
            message: "Masseuse fetched successfully",
            data: masseuse,
          });
        } else {
          res.status(400).send({
            success: false,
            message: "Masseuse doesnt exists",
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
exports.removeMasseuse = async (req, res, next) => {
  try {
    const { id } = req.params;
    let userId = req?.user;
    console.log(userId, id);
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
      let deletedMasseuse = await Masseuse.update(
        { isDeleted: true },
        {
          where: {
            id,
            userId,
          },
        }
      );
      console.log("deletedMasseuse", deletedMasseuse);
      if (deletedMasseuse[0] > 0) {
        res.status(200).send({ success: true, message: "Masseuse Deleted" });
      } else {
        res
          .status(202)
          .send({ success: false, message: "could not delete Masseuse." });
      }
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Server Error." });
  }
  // const { id } = req.params;
  // const validationErrors = [];
  // if (validator.isEmpty(id)) {
  // 	validationErrors.push('Id is required.');
  // }
  // if (validationErrors.length) {
  // 	res.status(400).send({
  // 		success: false,
  // 		message: 'Issue with data being send',
  // 		data: validationErrors,
  // 	});
  // } else {
  // 	Masseuse.findOne({ where: { id } })
  // 		.then((masseuse) => {
  // 			if (masseuse) {
  // 				masseuse
  // 					.update({ isDeleted: 1 })
  // 					.then((result) => {
  // 						res.status(200).send({
  // 							success: true,
  // 							message: 'Masseuse deleted successfully',
  // 						});
  // 					})
  // 					.catch((err) => {
  // 						res.status(400).send({
  // 							success: false,
  // 							message: `Something went worng ${err}`,
  // 						});
  // 					});
  // 			} else {
  // 				res.status(400).send({
  // 					success: false,
  // 					message: 'Masseuse doesnt exists',
  // 				});
  // 			}
  // 		})
  // 		.catch((err) => {
  // 			res.status(400).send({
  // 				success: false,
  // 				message: `Something went worng ${err}`,
  // 			});
  // 		});
  // }
};
exports.addMasseuse = async (req, res, next) => {
  try {
    let userId = req?.user;
    console.log("userId", userId);
    const {
      name,
      image,
      specialization,
      phone,
      website,
      hourOfOpertaion,
      location,
      instagram,
      facebook,
      twitter,
      spaId,
      city,
      services,
      otherInfo,
      comment,
      email,
      logo,
      elasticID,
    } = req.body;
    if (
      name
      // images &&
      // specialization &&
      // logo
      // &&    location &&
      // city
    ) {
      let service = await Masseuse.create({
        name,
        image,
        specialization,
        phone,
        website,
        hourOfOpertaion,
        location,
        instagram,
        email,
        facebook,
        otherInfo,
        twitter,
        city,
        userId,
        services,
        comment,
        logo,
        elasticID,
      });
      if (service?.dataValues) {
        if (spaId) {
          await spaMessause.create({
            spaId,
            masseuseId: service?.dataValues?.id,
          });
        }
        console.log(service?.dataValues?.id);
        let type = elasticID;
        await elasticSearch.addProperty(`${elasticID}_${service.id}`, {
          type,
          service,
        });
        console.log("After elastic search Masseuse");
        res.status(200).send({ success: true, message: "Masseuse Added" });
      } else {
        res
          .status(202)
          .send({ success: false, message: "could not add Masseuse." });
      }
    } else {
      console.log("something is missing.");
      res.status(400).send({ success: false, message: "Send Proper Data." });
    }
  } catch (err) {
    console.log("Error", err);
    res.status(503).send({ success: false, message: "Server Error." });
  }
  // if (validator.isEmpty(firstName)) {
  // 	validationErrors.push('firstName is required.');
  // }
  // if (validator.isEmpty(lastName)) {
  // 	validationErrors.push('lastName is required.');
  // }
  // if (validator.isEmpty(specialization)) {
  // 	validationErrors.push('specialization is required.');
  // }
  // if (validationErrors.length) {
  // 	res.status(400).send({
  // 		success: false,
  // 		message: 'Issue with data being send',
  // 		data: validationErrors,
  // 	});
  // } else {
  // 	Masseuse.create({
  // 		firstName,
  // 		lastName,
  // 		specialization,
  // 		isDeleted: 0,
  // 	})
  // 		.then((masseuse) => {
  // 			res.status(200).send({
  // 				success: true,
  // 				message: 'Masseuse added successfully',
  // 				data: masseuse,
  // 			});
  // 		})
  // 		.catch((err) => {
  // 			res.status(400).send({
  // 				success: false,
  // 				message: `Something went wrong ${err}`,
  // 			});
  // 		});
  // }
};
exports.updateMasseuse = async (req, res, next) => {
  try {
    console.log("INSIDE UPDATE MASSEUSE updateMasseuse: ", req.body);
    let userId = req?.user;
    let mId = req.params.id;

    const {
      name,
      image,
      specialization,
      phone,
      website,
      hourOfOpertaion,
      location,
      instagram,
      facebook,
      twitter,
      city,
      id,
      services,
      comment,
      email,
      logo,
      spaId: sid,
      changed_spaId,
      elasticID,
    } = req.body;

    let spaMassueExist;
    if (id && name) {
      if (changed_spaId) {
        console.log("SID is ", sid);
        console.log("changed sid is ", changed_spaId);
        console.log("Masseuse id is ", id);
        spaMassueExist = await spaMessause.findOne({
          where: { spaId: sid, masseuseId: id },
        });
      }
      console.log("After spaMessause findOne");
      console.log("is it exists", spaMassueExist);

      let updatedMasseuse = await Masseuse.update(
        {
          name,
          image,
          specialization,
          phone,
          website,
          hourOfOpertaion,
          location,
          instagram,
          facebook,
          twitter,
          city,
          services,
          comment,
          email,
          logo,
          sid,
        },
        {
          where: {
            id,
            userId,
            isDeleted: false,
          },
        }
      );
      if (updatedMasseuse[0] > 0) {
        console.log("In service update table ", sid);
        console.log("sid is ", sid);
        let sm;
        let createSpaMasseuse;
        if (!spaMassueExist) {
          createSpaMasseuse = await spaMessause.create({
            spaId: sid,
            masseuseId: id,
          });
        }

        if (changed_spaId && changed_spaId != sid) {
          sm = await spaMassueExist.update({ spaId: changed_spaId });
          console.log("sm is ", sm);
          if (!sm) {
            return res.status(200).send({
              message: "Cannot update SpaMasseuse service table",
              success: false,
            });
          }
        }

        let service = await Masseuse.findOne({
          where: {
            id,
          },
        });

        let type = elasticID;
        await elasticSearch.addProperty(`${elasticID}_${service.id}`, {
          type,
          service,
        });
        return res.status(200).send({
          message: "Masseuse updated",
          service,
          createSpaMasseuse,
          success: true,
        });
      } else {
        res
          .status(200)
          .send({ success: true, message: "Cannot update Masseuse" });
      }
      // console.log("updatedMasseuse", updatedMasseuse);
      // if (updatedMasseuse[0] > 0) {
      //   res.status(200).send({ success: true, message: "Masseuse Updated" });
      // } else {
      //   res
      //     .status(202)
      //     .send({ success: false, message: "could not update Masseuse." });
      // }
    } else {
      console.log("Something is missing.");
      res.status(400).send({ success: false, message: "Send proper Data." });
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Server Error." });
  }
  // const { firstName, lastName, specialization } = req.body;
  // const { id } = req.params;
  // if (id) {
  // 	Masseuse.findOne({
  // 		where: {
  // 			id,
  // 			isDeleted: 0,
  // 		},
  // 	})
  // 		.then((masseuse) => {
  // 			if (masseuse) {
  // 				masseuse
  // 					.update({
  // 						firstName: firstName ? firstName : masseuse.firstName,
  // 						lastName: lastName ? lastName : masseuse.lastName,
  // 						specialization: specialization
  // 							? specialization
  // 							: masseuse.specialization,
  // 					})
  // 					.then((data) => {
  // 						res.status(200).send({
  // 							success: true,
  // 							message: 'Masseuse updated successfully =)',
  // 							data: data,
  // 						});
  // 					})
  // 					.catch((err) => {
  // 						res.status(400).send({
  // 							success: false,
  // 							message: err,
  // 						});
  // 					});
  // 			} else {
  // 				res.status(400).send({
  // 					success: false,
  // 					message: 'Masseuse not found',
  // 				});
  // 			}
  // 		})
  // 		.catch((err) => console.log(err));
  // } else {
  // 	res
  // 		.status(400)
  // 		.send({ success: false, message: 'Id of Masseuse is required' });
  // }
};

exports.getApprovedMasseuse = async (req, res) => {
  try {
    let id = req.params.id;
    let masseusesData;
    if (id === "all") {
      masseusesData = await Masseuse.findAll({
        where: {
          isDeleted: false,
          isApproved: true,
        },
      });
    } else {
      masseusesData = await spa.findAll({
        where: {
          id,
          isDeleted: false,
          isApproved: true,
        },
      });
    }
    console.log("masseusesData", masseusesData);
    if (spasData?.length) {
      res
        .status(200)
        .send({ success: true, message: "data found.", data: masseusesData });
    } else {
      res.status(200).send({
        success: false,
        message: "data not found.",
        data: masseusesData,
      });
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Server Error." });
  }
};

exports.addViews = async (req, res) => {
  try {
    let masseuseId = req.params.id;
    if (masseuseId) {
      let masseuseData = await Masseuse.update(
        {
          views: sequelize.literal("views + 1"),
        },
        {
          where: {
            id: masseuseId,
          },
        }
      );
      console.log("masseuseData", masseuseData);
      if (masseuseData[0] > 0) {
        res.status(200).send({ success: true, message: "view added." });
      } else {
        res
          .status(200)
          .send({ success: false, message: "could not add view." });
      }
    } else {
      console.log("Something is missing");
      res.status(400).send({ success: false, message: "Send proper data." });
    }
  } catch (err) {
    console.log("Error", err);
    res.status(503).send({ success: false, message: "Server Error." });
  }
};

/************admin ************/
exports.allMasseuses = async (req, res) => {
  try {
    let id = req.params.id;
    console.log("Masseuse Id", id);
    if (id) {
      let messeuseData;
      if (id === "all") {
        messeuseData = await Masseuse.findAll({
          where: {
            isDeleted: false,
          },
        });
      } else {
        messeuseData = await Masseuse.findAll({
          where: {
            id,
            isDeleted: false,
          },
        });
      }
      console.log("messeuseData", messeuseData);
      if (messeuseData?.length) {
        res
          .status(200)
          .send({ success: true, message: "data found.", data: messeuseData });
      } else {
        console.log("could not find data.");
        res.status(200).send({ success: false, message: "Data not found." });
      }
    } else {
      console.log("Something is missing.");
      res.status(400).send({ success: false, message: "Send proper Data." });
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Server Error." });
  }
};

exports.approveMasseuse = async (req, res) => {
  try {
    let id = req.params.id;
    console.log("Masseuse Id", id);
    if (id) {
      let approvedMasseuse = await Masseuse.update(
        {
          isApproved: true,
        },
        {
          where: {
            id,
            isDeleted: false,
          },
        }
      );
      console.log("approvedMasseuse", approvedMasseuse);
      if (approvedMasseuse[0] > 0) {
        res.status(200).send({ success: true, message: "Approved" });
      } else {
        res.status(200).send({ success: false, message: "Not Approved" });
      }
    } else {
      console.log("Something is missing.");
      res.status(400).send({ success: false, message: "Send proper Data." });
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Server Error." });
  }
};

exports.removeMasseuse = async (req, res) => {
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
    Masseuse.findOne({ where: { id } })
      .then((masseuse) => {
        if (masseuse) {
          masseuse
            .update({ isDeleted: 1 })
            .then((result) => {
              res.status(200).send({
                success: true,
                message: "Masseuse Deleted Successfully",
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
            message: "masseuse doesnt exists",
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

// delete multiple masseuse
exports.deleteMultipleMasseuse = async (req, res) => {
  try {
    let ids = req.body.ids;
    console.log("Spa Ids", ids);
    if (ids?.length) {
      let deletedMasseuse = await Masseuse.update(
        {
          isDeleted: true,
        },
        {
          where: {
            id: ids,
          },
        }
      );
      console.log("deletedMasseuse", deletedMasseuse);
      if (deletedMasseuse[0] > 0) {
        res.status(200).send({ success: true, message: "Masseuse Deleted" });
      } else {
        res.status(200).send({ success: false, message: "not deleted." });
      }
    } else {
      console.log("Something is missing.");
      res.status(400).send({ success: false, message: "Send proper Data." });
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Server Error." });
  }
};

exports.getMasseuseParant = async (req, res) => {
  const { id } = req.params;
  SpaMasseuse.findOne({ where: { masseuseId: id } })
    .then((masseuse) => {
      res.status(200).send({
        success: true,
        message: "parant fetch Successfully",
        data: masseuse,
      });
    })
    .catch((err) => {
      res.status(400).send({
        success: false,
        message: `Something went worng ${err}`,
      });
    });
};
