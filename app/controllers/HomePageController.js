const HomePage = require("../models/HomePage");
const adminSession = require("../models/AdminSession");
const User = require("../models/User");
const Spa = require("../models/Spa");
const Masseuse = require("../models/Masseuse");
var multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "ImagesHomepage");
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

exports.getHomePageHtml = async (req, res) => {
  try {
    console.log("BACKEND ALL Homepage");

    let homepage = await HomePage.findAll({
      where: {
        isDeleted: 0,
      },
    });
    if (homepage?.length) {
      return res.status(200).json({
        message: "homepages are found",
        success: true,
        homepage_data: homepage,
      });
    } else {
      return res.status(200).json({
        message: "No homepage found",
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

exports.createHomePageHtml = async (req, res) => {
  try {
    console.log(req.body);
    const { content } = req.body;
    const uploadedImage = req.file.path;
    console.log("File Path is ");
    console.log(uploadedImage);
    //for multiple files
    //const uploadedImage = req.file.path;
    HomePage.create({
      content,
      image: uploadedImage,
      isDeleted: 0,
    })
      .then((homepage) => {
        res.status(200).json({
          success: true,
          message: "HomePage created",
          data: homepage,
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
  //console.log("request body", businessCreated);
};

exports.editHomepageHtml = async (req, res) => {
  try {
    const homePageEditId = req?.params?.id;
    const { content } = req.body;
    const uploadedImage = req?.file?.path;
    console.log("Edited HomePage");
    console.log(content);
    console.log(homePageEditId);
    console.log(req);
    HomePage.findOne({
      where: {
        id: homePageEditId,
      },
    }).then(async (found) => {
      if (found) {
        await HomePage.update(
          {
            content,
            // content: contentReq ? contentReq : found.content,
            image: uploadedImage ? uploadedImage : found.image,
          },
          {
            where: {
              id: homePageEditId,
            },
          }
        );
        HomePage.findOne({
          where: {
            id: homePageEditId,
          },
        })
          .then((updatedHomePage) => {
            if (updatedHomePage) {
              res.status(200).json({
                success: true,
                message: "HomePage Updated",
                data: updatedHomePage,
              });
            } else {
              return res.status(200).send({
                success: false,
                message: "Canot update HomePage Something went Wrong",
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
          .send({ success: false, message: "HomePage doesn't exit" });
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

exports.deleteHomePageHtml = async (req, res) => {
  console.log("Delete Homepage");
  try {
    const homePageDeleteId = req?.params?.id;
    //const { heading: headingReq, content: contentReq } = req.body;
    //console.log(contentReq);

    HomePage.findOne({
      where: {
        id: homePageDeleteId,
        isDeleted: 0,
      },
    }).then(async (found) => {
      if (found) {
        HomePage.update(
          {
            isDeleted: 1,
          },
          {
            where: {
              id: homePageDeleteId,
            },
          }
        )
          .then((found) => {
            return res.status(200).send({
              success: true,
              message: "HomePage deleted successfully",
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
          .send({ success: false, message: "cannot delete HomePage" });
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
