const Business = require("../models/Business");
const adminSession = require("../models/AdminSession");
const User = require("../models/User");
const Spa = require("../models/Spa");
const Masseuse = require("../models/Masseuse");
var multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.originalname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

exports.upload = multer({
  storage: storage,
  limits: { fileSize: "1000000" },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    //check the file if it has same extension as above which user uploads
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));

    if (mimeType && extname) {
      return cb(null, true);
    }
    cb("Give proper files formate to upload");
  },
}).single("image");

exports.getBusiness = async (req, res) => {
  try {
    console.log("BACKEND ALL BUSINESSES");

    let business = await Business.findAll({
      where: {
        isDeleted: 0,
      },
    });
    if (business?.length) {
      return res.status(200).json({
        message: "Businesses are found",
        success: true,
        business_data: business,
      });
    } else {
      return res.status(200).json({
        message: "No business found",
        success: false,
        code: 121,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 023,
    });
  }
};

exports.createBusiness = async (req, res) => {
  try {
    console.log(req.body);
    const { content } = req.body;
    const uploadedImage = req.file.path;
    console.log("File Path is ");
    console.log(uploadedImage);
    //for multiple files
    //const uploadedImage = req.file.path;
    Business.create({
      content,
      image: uploadedImage,
      isDeleted: 0,
    })
      .then((business) => {
        res.status(200).json({
          success: true,
          message: "Business created",
          data: business,
        });
      })
      .catch((error) => {
        return res.status(400).send({
          success: false,
          message: error,
        });
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 023,
    });
  }
  //console.log("reqest body", businessCreated);
};

exports.editBusiness = async (req, res) => {
  try {
    const businessEditId = req?.params?.id;
    const { content } = req.body;
    const uploadedImage = req?.file?.path;
    console.log("Edited Business");
    console.log(content);
    console.log(businessEditId);
    console.log(req);
    Business.findOne({
      where: {
        id: businessEditId,
      },
    }).then(async (found) => {
      if (found) {
        await Business.update(
          {
            content,
            // content: contentReq ? contentReq : found.content,
            image: uploadedImage ? uploadedImage : found.image,
          },
          {
            where: {
              id: businessEditId,
            },
          }
        );
        Business.findOne({
          where: {
            id: businessEditId,
          },
        })
          .then((updatedBusiness) => {
            if (updatedBusiness) {
              res.status(200).json({
                success: true,
                message: "Business Updated",
                data: updatedBusiness,
              });
            } else {
              return res.status(200).send({
                success: false,
                message: "Canot update Business Something went Wrong",
              });
            }
          })
          .catch((error) => {
            return res.status(200).json({
              message: `try/catch err: ${error}`,
              success: false,
            });
          });
      } else {
        res
          .status(200)
          .send({ success: false, message: "Business doesn't exit" });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 023,
    });
  }
  //console.log("reqest body", businessCreated);
};

exports.deleteBusiness = async (req, res) => {
  try {
    const businessDeleteId = req?.params?.id;
    //const { heading: headingReq, content: contentReq } = req.body;
    //console.log(contentReq);

    Business.findOne({
      where: {
        id: businessDeleteId,
        isDeleted: 0,
      },
    }).then(async (found) => {
      if (found) {
        Business.update(
          {
            isDeleted: 1,
          },
          {
            where: {
              id: businessDeleteId,
            },
          }
        )
          .then((found) => {
            return res.status(200).send({
              success: true,
              message: "Business deleted successfully",
            });
          })
          .catch((error) => {
            return res
              .status(200)
              .send({ success: false, message: "Is soft deleted already" });
          });
      } else {
        res
          .status(200)
          .send({ success: false, message: "cannot delete Business" });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 023,
    });
  }
  //console.log("reqest body", businessCreated);
};

// exports.uploadImageBusiness = async (req, res) => {
//   try {
//     if (!req.fileValidationError) {
//       console.log("image", req?.file?.filename);
//       let fileUrl = req?.file?.filename;
//       res.status(200).send({ img_url: fileUrl });
//     } else {
//       console.log("error");
//     }
//   } catch (err) {
//     console.log("error", err);
//     res.status(503).send({ success: false, message: "Internal Server Error." });
//   }
// };

exports.activeUsers = async (req, res) => {
  try {
    User.findAndCountAll({
      where: {
        isDeleted: false,
      },
    })
      .then((data) => {
        if (data) {
          res.status(200).json({
            success: true,
            message: "Count of active users are ",
            active_Users: data.count,
          });
        } else {
          res.status(200).json({
            success: false,
            message: "No active users",
          });
        }
      })
      .catch((error) => {
        return res
          .status(200)
          .send({ success: false, message: "No active users" });
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 023,
    });
  }
};

exports.hSpaBUsinesses = async (req, res) => {
  try {
    Spa.findAndCountAll({
      where: {
        isDeleted: false,
      },
    })
      .then((data) => {
        if (data) {
          res.status(200).json({
            success: true,
            message: "Count of hspa businesses are ",
            hspa_businesses: data.count,
          });
        } else {
          res.status(200).json({
            success: false,
            message: "No hspa businesses",
          });
        }
      })
      .catch((error) => {
        return res
          .status(200)
          .send({ success: false, message: "No hspa businesses" });
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 023,
    });
  }
};

exports.masseuseProfiles = async (req, res) => {
  try {
    Masseuse.findAndCountAll({
      where: {
        isDeleted: false,
      },
    })
      .then((data) => {
        if (data) {
          res.status(200).json({
            success: true,
            message: "Count of Masseuse Profiles are ",
            masseuse_profiles: data.count,
          });
        } else {
          res.status(200).json({
            success: false,
            message: "No Masseuse Profiles",
          });
        }
      })
      .catch((error) => {
        return res
          .status(200)
          .send({ success: false, message: "No Masseuse Profiles" });
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 023,
    });
  }
};

exports.pageViews = async (req, res, next) => {
  try {
    let spaSum = await Spa.sum("views");
    let messeuseSum = await Masseuse.sum("views");
    let sum = spaSum + messeuseSum;

    res.status(200).send({
      message: "Sum is ",
      sum,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 023,
    });
  }
};
