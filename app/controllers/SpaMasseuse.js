const validator = require("validator");
const Masseuse = require("../models/Masseuse");
const Spa = require("../models/Spa");
const SpaForum = require("../models/SpaForum");
const MasseuseForum = require("../models/MasseuseForum");
const SpaMasseuse = require("../models/SpaMasseuse");
const SpaComment = require("../models/SpaComment");
const MasseuseComment = require("../models/MasseuseComment");

exports.allSpaMasseuse = (req, res, next) => {
  SpaForum.findAll({
    where: { isDeleted: 0 },
    include: [
      { model: SpaComment, include: [{ model: SpaComment, as: "Replies" }] },
    ],
    order: [["id", "DESC"]],
  })
    .then((serviceOfSpa) => {
      MasseuseForum.findAll({
        where: { isDeleted: 0 },
        include: [
          {
            model: MasseuseComment,
            include: [{ model: MasseuseComment, as: "Replies" }],
          },
        ],
        order: [["id", "DESC"]],
      }).then((serviceOfMasseuse) => {
        const spaMasseuse = serviceOfSpa.concat(serviceOfMasseuse);

        res.status(200).send({
          success: true,
          message: "Spa masseuse fetched successfully",
          data: spaMasseuse,
        });
      });
    })
    .catch((err) => {
      res.status(400).send({
        success: false,
        message: `Something went wrong  ${err}`,
      });
    });
};

exports.singleSpaMasseuse = (req, res, next) => {
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
    SpaMasseuse.findOne({
      where: { id, isDeleted: 0 },
      include: [{ model: Spa }, { model: Masseuse }],
    })
      .then((service) => {
        if (service) {
          res.status(200).send({
            success: true,
            message: "Spa masseuse fetched successfully",
            data: service,
          });
        } else {
          res.status(400).send({
            success: false,
            message: "Spa masseuse doesnt exists",
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
exports.removeSpaMasseuse = (req, res, next) => {
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
    SpaMasseuse.findOne({ where: { id } })
      .then((service) => {
        if (service) {
          service
            .update({ isDeleted: 1 })
            .then((result) => {
              res.status(200).send({
                success: true,
                message: "Spa masseuse deleted successfully",
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
            message: "Spa masseuse doesnt exists",
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
exports.addSpaMasseuse = (req, res, next) => {
  const { spaId, masseuseId } = req.body;
  const validationErrors = [];
  if (validator.isEmpty(spaId)) {
    validationErrors.push("spaId is required.");
  }
  if (validator.isEmpty(masseuseId)) {
    validationErrors.push("masseuseId is required.");
  }
  if (validationErrors.length) {
    res.status(400).send({
      success: false,
      message: "Issue with data being send",
      data: validationErrors,
    });
  } else {
    let service = [];
    if (masseuseId.includes(",")) {
      let ids = masseuseId.split(",");
      for (i = 0; i < ids.length; i++) {
        service.push({
          spaId,
          masseuseId: ids[i],
          isDeleted: 0,
        });
      }
    } else {
      service.push({
        spaId,
        masseuseId,
        isDeleted: 0,
      });
    }
    SpaMasseuse.bulkCreate(service)
      .then((service) => {
        res.status(200).send({
          success: true,
          message: "Spa masseuse added successfully",
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
exports.updateSpaMasseuse = (req, res, next) => {
  const { spaId, masseuseId } = req.body;
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
    SpaMasseuse.findOne({ where: { id, isDeleted: 0 } })
      .then((service) => {
        if (service) {
          service
            .update({
              spaId: spaId ? spaId : service.spaId,
              masseuseId: masseuseId ? masseuseId : service.masseuseId,
            })
            .then((result) => {
              res.status(200).send({
                success: true,
                message: "Spa masseuse updated successfully",
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
            message: "Spa masseuse doesnt exists",
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
