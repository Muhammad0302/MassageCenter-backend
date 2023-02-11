const validator = require("validator");
const Spa = require("../models/Spa");
const path = require("path");
const fs = require("fs");

exports.allSpas = async (req, res, next) => {
  try {
    let id = req.params.id;
    console.log("Spa Id", id);
    if (id) {
      let spaData;
      if (id === "all") {
        spaData = await Spa.findAll({
          where: {
            isDeleted: false,
          },
        });
      } else {
        spaData = await Spa.findAll({
          where: {
            id,
            isDeleted: false,
          },
        });
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
  // Spa.findAll({ where: { isDeleted: 0 } })
  // 	.then((spas) => {
  // 		res.status(200).send({
  // 			success: true,
  // 			message: 'Spas fetched successfully',
  // 			data: spas,
  // 		});
  // 	})
  // 	.catch((err) => {
  // 		res.status(400).send({
  // 			success: false,
  // 			message: `issue fetching data ${err}`,
  // 		});
  // 	});
};
exports.singleSpa = (req, res, next) => {
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
    Spa.findOne({ where: { id, isDeleted: 0 } })
      .then((spa) => {
        if (spa) {
          res.status(200).send({
            success: true,
            message: "Spa fetched successfully",
            data: spa,
          });
        } else {
          res.status(400).send({
            success: false,
            message: "Spa doesnt exists",
            data: spa,
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
exports.removeSpa = (req, res, next) => {
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
    Spa.findOne({ where: { id } })
      .then((spa) => {
        if (spa) {
          spa
            .update({ isDeleted: 1 })
            .then((result) => {
              res.status(200).send({
                success: true,
                message: "Spa deleted successfully",
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
            message: "Spa doesnt exists",
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
exports.addSpa = (req, res, next) => {
  const validationErrors = [];
  const { name, website, hourOfOpertaion, phone } = req.body;
  if (validator.isEmpty(name)) {
    validationErrors.push("Name is required.");
  }
  if (validator.isEmpty(website)) {
    validationErrors.push("Website is required.");
  }
  if (validator.isEmpty(hourOfOpertaion)) {
    validationErrors.push("Hour of opertaion is required.");
  }
  if (validator.isEmpty(phone)) {
    validationErrors.push("Phone is required.");
  }
  if (!req.files) {
    validationErrors.push("Image is required");
  }
  if (validationErrors.length) {
    res.status(400).send({
      success: false,
      message: "Issue with data being send",
      data: validationErrors,
    });
  } else {
    const dir = path.join(__dirname, "../../public", "/uploads/spaMedia/");
    let spaImage = req.files.file;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    var currentDate = new Date().getTime();
    //Use the mv() method to place the file in upload directory (i.e. "uploads")
    spaImage.mv(dir + currentDate + spaImage.name);
    console.log(currentDate);
    Spa.create({
      name,
      website,
      hourOfOpertaion,
      phone,
      image: "/uploads/spaMedia/" + currentDate + spaImage.name,
    })
      .then((spa) => {
        res.status(200).send({
          success: true,
          message: "Spa added successfully",
          data: spa,
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
exports.updateSpa = (req, res, nexxt) => {
  const { name, website, hourOfOpertaion, phone } = req.body;
  const { id } = req.params;
  if (id) {
    Spa.findOne({
      where: {
        id,
        isDeleted: 0,
      },
    })
      .then((spa) => {
        if (spa) {
          if (req.files) {
            const dir = path.join(
              __dirname,
              "../../public",
              "/uploads/spaMedia/"
            );
            let spaImage = req.files.file;
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir);
            }
            const filePath = path.join(__dirname + "../../../public");
            if (fs.existsSync(filePath + spa.image)) {
              fs.unlinkSync(filePath + spa.image);
            }
            var currentDate = new Date().getTime();
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            spaImage.mv(dir + currentDate + spaImage.name);
          }
          spa
            .update({
              name: name ? name : spa.name,
              website: website ? website : spa.website,
              phone: phone ? phone : spa.phone,
              hourOfOpertaion: hourOfOpertaion
                ? hourOfOpertaion
                : spa.hourOfOpertaion,

              image: req.files
                ? "/uploads/spaMedia/" + currentDate + req.files.file.name
                : spa.image,
            })
            .then((data) => {
              res.status(200).send({
                success: true,
                message: "Spa updated successfully =)",
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
            message: "Spa not found",
          });
        }
      })
      .catch((err) => console.log(err));
  } else {
    res.status(400).send({ success: false, message: "id of user is required" });
  }
};

// approve spa
exports.approveSpa = async (req, res) => {
  try {
    let id = req.params.id;
    console.log("Spa Id", id);
    if (id) {
      let approvedSpa = await Spa.update(
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
      console.log("approvedSpa", approvedSpa);
      if (approvedSpa[0] > 0) {
        res.status(200).send({ success: true, message: "approved." });
      } else {
        res.status(200).send({ success: false, message: "not approved." });
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

// delete multiple spas
exports.deleteMultipleSpas = async (req, res) => {
  try {
    let ids = req.body.ids;
    console.log("Spa Ids", ids);
    if (ids?.length) {
      let deletedSpas = await Spa.update(
        {
          isDeleted: true,
        },
        {
          where: {
            id: ids,
          },
        }
      );
      console.log("deletedSpas", deletedSpas);
      if (deletedSpas[0] > 0) {
        res.status(200).send({ success: true, message: "Spas Deleted." });
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
