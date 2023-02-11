const validator = require("validator");
const Services = require("../models/Services");

exports.allServices = (req, res, next) => {
  Services.findAll({ where: { isDeleted: 0 } })
    .then((service) => {
      res.status(200).send({
        success: true,
        message: "Service fetched successfully",
        data: service,
      });
    })
    .catch((err) => {
      res.status(400).send({
        success: false,
        message: `issue fetching data ${err}`,
      });
    });
};
exports.singleServices = (req, res, next) => {
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
    Services.findOne({ where: { id, isDeleted: 0 } })
      .then((service) => {
        if (service) {
          res.status(200).send({
            success: true,
            message: "Service fetched successfully",
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
exports.removeService = (req, res, next) => {
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
    Services.findOne({ where: { id } })
      .then((service) => {
        if (service) {
          service
            .update({ isDeleted: 1 })
            .then((result) => {
              res.status(200).send({
                success: true,
                message: "Service deleted successfully",
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
            message: "Service doesnt exists",
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
exports.addService = (req, res, next) => {
  const { name, description } = req.body;
  const validationErrors = [];
  if (validator.isEmpty(name)) {
    validationErrors.push("Name is required.");
  }
  if (validationErrors.length) {
    res.status(400).send({
      success: false,
      message: "Issue with data being send",
      data: validationErrors,
    });
  } else {
    Services.create({ name, description, isDeleted: 0 })
      .then((service) => {
        res.status(200).send({
          success: true,
          message: "Service added successfully",
          data: service,
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
exports.updateService = (req, res, next) => {
  const { name, description } = req.body;
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
    Services.findOne({ where: { id, isDeleted: 0 } })
      .then((service) => {
        console.log(service);
        if (service) {
          service
            .update({
              name: name ? name : service.name,
              description: description ? description : service.description,
            })
            .then((result) => {
              res.status(200).send({
                success: true,
                message: "Service updated successfully",
                data: result,
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
            message: "Service doesnt exists",
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
