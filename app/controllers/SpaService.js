const validator = require("validator");
const spa = require("../models/Spa");
const masseuse = require("../models/Masseuse");
const sequelize = require("../../config/database");
const SpaService = require("../models/SpaService");
const ReviewRatingSpa = require("../models/ReviewRatingSpa");
const spaMessause = require("../models/spaMessause");
const elasticSearch = require("../helpher/elasticsearch");
const SpaMasseuse = require("../models/spaMessause");

exports.allSpaServicebyUser = async (req, res, next) => {
  try {
    let userId = req?.user ? req.user : null;
    let id = req.params.id;
    console.log(id, userId);
    if (id) {
      let spaData;
      if (id === "all") {
        spaData = await spa.findAll({
          where: {
            userId,
            isDeleted: false,
          },
          include: [
            // {
            // 	model: cities
            // },
            {
              model: ReviewRatingSpa,
              attributes: ["rating"],
            },
          ],
        });
      } else {
        spaData = await spa.findAll({
          where: {
            id,
            userId,
            isDeleted: false,
          },
          // include: [
          //   {
          //     model: cities,
          //   },
          // ],
        });
      }
      //console.log("spaData", spaData);
      if (spaData?.length) {
        res
          .status(200)
          .send({ success: true, message: "data found.", data: spaData });
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

  // SpaService.findAll({ where: { isDeleted: 0 } })
  // 	.then((service) => {
  // 		res.status(200).send({
  // 			success: true,
  // 			message: 'Spa service fetched successfully',
  // 			data: service,
  // 		});
  // 	})
  // 	.catch((err) => {
  // 		res.status(400).send({
  // 			success: false,
  // 			message: `issue fetching data ${err}`,
  // 		});
  // 	});
};
exports.allSpaService = async (req, res, next) => {
  try {
    let userId = req?.user ? req.user : null;
    let id = req.params.id;
    console.log(id, userId);
    if (id) {
      let spaData;
      if (id === "all") {
        spaData = await spa.findAll({
          where: {
            // userId,
            isDeleted: false,
          },
          include: [
            {
              model: ReviewRatingSpa,
              attributes: ["rating"],
            },
          ],
        });
      } else {
        spaData = await spa.findAll({
          where: {
            id,
            // userId,
            isDeleted: false,
          },
          include: [
            {
              model: spaMessause,
              attributes: ["masseuseId"],

              include: {
                model: masseuse,
              },
            },
          ],
        });
        const updateView = await spa.findOne({
          where: {
            id,
            // userId,
            isDeleted: false,
          },
        });
        updateView.update({ views: parseInt(updateView.views) + 1 });
      }
      console.log("spaData", spaData);
      if (spaData?.length) {
        res
          .status(200)
          .send({ success: true, message: "data found.", data: spaData });
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

  // SpaService.findAll({ where: { isDeleted: 0 } })
  // 	.then((service) => {
  // 		res.status(200).send({
  // 			success: true,
  // 			message: 'Spa service fetched successfully',
  // 			data: service,
  // 		});
  // 	})
  // 	.catch((err) => {
  // 		res.status(400).send({
  // 			success: false,
  // 			message: `issue fetching data ${err}`,
  // 		});
  // 	});
};
exports.singleSpaService = (req, res, next) => {
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
    SpaService.findOne({ where: { id, isDeleted: 0 } })
      .then((service) => {
        if (service) {
          res.status(200).send({
            success: true,
            message: "Spa service fetched successfully",
            data: service,
          });
        } else {
          res.status(400).send({
            success: false,
            message: "Service doesnt exists",
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
exports.removeSpaService = async (req, res, next) => {
  try {
    const { id } = req.params;
    let userId = req?.user;
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
      let deletedSpa = await spa.update(
        { isDeleted: true },
        {
          where: {
            id,
            userId,
          },
        }
      );
      console.log("deletedSpa", deletedSpa);
      if (deletedSpa[0] > 0) {
        res.status(200).send({ success: true, message: "Spa Deleted" });
      } else {
        res
          .status(202)
          .send({ success: false, message: "could not delete spa." });
      }
      // SpaService.findOne({ where: { id } })
      // 	.then((service) => {
      // 		if (service) {
      // 			service
      // 				.update({ isDeleted: 1 })
      // 				.then((result) => {
      // 					res.status(200).send({
      // 						success: true,
      // 						message: 'Spa service deleted successfully',
      // 					});
      // 				})
      // 				.catch((err) => {
      // 					res.status(400).send({
      // 						success: false,
      // 						message: `Something went worng ${err}`,
      // 					});
      // 				});
      // 		} else {
      // 			res.status(400).send({
      // 				success: false,
      // 				message: 'Spa service doesnt exists',
      // 			});
      // 		}
      // 	})
      // 	.catch((err) => {
      // 		res.status(400).send({
      // 			success: false,
      // 			message: `Something went wrong ${err}`,
      // 		});
      // 	});
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Server Error." });
  }
};
exports.addSpaService = async (req, res, next) => {
  try {
    let userId = req?.user;
    //console.log("userId", userId);
    let {
      name,
      image,
      phone,
      website,
      hourOfOpertaion,
      city,
      location,
      services,
      comment,
      email,
      otherInfo,
      logo,
      elasticID,
    } = req.body;
    if (
      userId &&
      name &&
      // image &&
      phone &&
      hourOfOpertaion &&
      // city &&
      location
      // &&
      // services
    ) {
      let service = await spa.create({
        name,
        image,
        email,
        phone,
        website,
        hourOfOpertaion,
        city,
        location,
        userId,
        services,
        otherInfo,
        comment,
        logo,
      });
      // console.log("addedSpa", addedSpa);
      if (service?.dataValues) {
        let type = elasticID;
        await elasticSearch.addProperty(`${elasticID}_${service.id}`, {
          type,
          service,
        });
        console.log("After elastic search");
        res.status(200).send({ success: true, message: "Spa Added" });
      } else {
        res.status(202).send({ success: false, message: "could not add spa." });
      }
    } else {
      console.log("Something is missing.");
      res.status(400).send({ success: false, message: "Send proper Data." });
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Server Error." });
  }
  // const { spaId, serviceId } = req.body;
  // const validationErrors = [];
  // if (validator.isEmpty(spaId)) {
  // 	validationErrors.push('spaId is required.');
  // }
  // if (validator.isEmpty(serviceId)) {
  // 	validationErrors.push('serviceId is required.');
  // }
  // if (validationErrors.length) {
  // 	res.status(400).send({
  // 		success: false,
  // 		message: 'Issue with data being send',
  // 		data: validationErrors,
  // 	});
  // } else {
  // 	let service = [];
  // 	if (serviceId.includes(',')) {
  // 		let ids = serviceId.split(',');
  // 		for (i = 0; i < ids.length; i++) {
  // 			service.push({
  // 				spaId,
  // 				serviceId: ids[i],
  // 				isDeleted: 0,
  // 			});
  // 		}
  // 	} else {
  // 		service.push({
  // 			spaId,
  // 			serviceId,
  // 			isDeleted: 0,
  // 		});
  // 	}
  // 	SpaService.bulkCreate(service)
  // 		.then((service) => {
  // 			res.status(200).send({
  // 				success: true,
  // 				message: 'Spa service added successfully',
  // 				data: service,
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
exports.updateSpaService = async (req, res, next) => {
  try {
    let userId = req?.user;
    const {
      name,
      image,
      phone,
      website,
      hourOfOpertaion,
      city,
      location,
      services,
      comment,
      email,
      logo,
      elasticID,
    } = req.body;
    const { id } = req.params;
    console.log(
      userId,
      id,
      name,
      image,
      phone,
      website,
      hourOfOpertaion,
      city,
      location,
      services,
      comment
    );
    if (userId && id && name && phone && hourOfOpertaion && location) {
      let updatedservice = await spa.update(
        {
          name,
          image,
          phone,
          website,
          hourOfOpertaion,
          city,
          location,
          services,
          comment,
          email,
          logo,
        },
        {
          where: {
            id,
            userId,
            isDeleted: false,
          },
        }
      );
      console.log("updatedSpa", updatedservice);
      if (updatedservice[0] > 0) {
        let service = await spa.findOne({
          where: {
            id,
          },
        });

        let type = elasticID;
        await elasticSearch.addProperty(`${elasticID}_${service.id}`, {
          type,
          service,
        });
        res
          .status(200)
          .send({ success: true, message: "Spa Updated", service });
      } else {
        res
          .status(202)
          .send({ success: false, message: "could not update spa." });
      }
    } else {
      console.log("Something is missing.");
      res.status(400).send({ success: false, message: "Send proper Data." });
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Server Error." });
  }
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
  // 	SpaService.findOne({ where: { id, isDeleted: 0 } })
  // 		.then((service) => {
  // 			if (service) {
  // 				service
  // 					.update({
  // 						spaId: spaId ? spaId : service.spaId,
  // 						serviceId: serviceId ? serviceId : service.serviceId,
  // 					})
  // 					.then((result) => {
  // 						res.status(200).send({
  // 							success: true,
  // 							message: 'Spa service updated successfully',
  // 							data: result,
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
  // 					message: 'Service doesnt exists',
  // 				});
  // 			}
  // 		})
  // 		.catch((err) => {
  // 			res.status(400).send({
  // 				success: false,
  // 				message: `Something went wrong ${err}`,
  // 			});
  // 		});
  // }
};

exports.getApprovedSpas = async (req, res) => {
  try {
    let id = req.params.id;
    let spasData;
    if (id === "all") {
      spasData = await spa.findAll({
        where: {
          isDeleted: false,
          isApproved: true,
        },
      });
    } else {
      spasData = await spa.findAll({
        where: {
          id,
          isDeleted: false,
          isApproved: true,
        },
      });
    }
    console.log("spasData", spasData);
    if (spasData?.length) {
      res
        .status(200)
        .send({ success: true, message: "data found.", data: spasData });
    } else {
      res
        .status(200)
        .send({ success: false, message: "data not found.", data: spasData });
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Server Error." });
  }
};

exports.addViews = async (req, res) => {
  try {
    let spaId = req.params.id;
    if (spaId) {
      let spaData = await spa.update(
        {
          views: sequelize.literal("views + 1"),
        },
        {
          where: {
            id: spaId,
          },
        }
      );
      console.log("spaData", spaData);
      if (spaData[0] > 0) {
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

exports.geSpaChild = async (req, res) => {
  const { id } = req.params;
  SpaMasseuse.findAll({ where: { spaId: id } })
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
