const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const router = express.Router();
const upload = require("../app/controllers/uploadImages");
const advertise = require("..//app/controllers/AdvertiseImages");
const AuthController = require("../app/controllers/AuthController");
const AdminAuthController = require("../app/controllers/AdminAuthController");
const SpaController = require("../app/controllers/SpaController");
const Services = require("../app/controllers/Services");
const cities = require("../app/models/cities");
const SpaService = require("../app/controllers/SpaService");
const SpaMasseuse = require("../app/controllers/SpaMasseuse");
const ReviewRatingSpa = require("../app/controllers/ReviewRatingSpa");
const ReviewRatingMasseuse = require("../app/controllers/ReviewRatingMasseuse");
const SpaForum = require("../app/controllers/SpaForum");
const MasseuseForum = require("../app/controllers/MasseuseForum");
const SpaComment = require("../app/controllers/SpaComment");
const MasseuseComment = require("../app/controllers/MasseuseComment");
const { adminAuth, userAuth } = require("../app/middlewares/isAuth");
const Masseuse = require("../app/controllers/Masseuse");
const Users = require("../app/controllers/user");
const BusinessPurposeController = require("../app/controllers/BusinessPurposeController");
const SearchController = require("../app/controllers/searchController");
const HomePageController = require("../app/controllers/HomePageController");
const UserActivityController = require("../app/controllers/UserActivityController");
const { uploadImage } = require("../app/uploadCards/uploadImage");
const { BusinessEntityStats } = require("../app/controllers/helperController");
const ForumController = require("../app/controllers/ForumController");
// const {
//   verifyEmailVerificationToken,
//   createEmailVerificationToken,
//   createAccessToken,
// } = require("../helpher/jwtFunctions");
const sendMail = require("../app/helpher/sendMail");

const adminPrefix = "/admin";

router.post(
  "/sendadvertiseemail",
  [
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  ],
  AuthController.AdvertiseFunction
);

// Homepage

router.get("/pageviews", BusinessPurposeController.pageViews);

router.get(`${adminPrefix}/gethomepage`, HomePageController.getHomePageHtml);

router.post(
  `${adminPrefix}/createhomepagehtml`,
  adminAuth,
  HomePageController.upload,
  HomePageController.createHomePageHtml
);

router.put(
  `${adminPrefix}/edithomepage/:id`,
  adminAuth,
  HomePageController.upload,
  HomePageController.editHomepageHtml
);

router.delete(
  `${adminPrefix}/deletehomepage/:id`,
  adminAuth,
  HomePageController.deleteHomePageHtml
);

// Business

router.get(`${adminPrefix}/getbusiness`, BusinessPurposeController.getBusiness);

router.post(
  `${adminPrefix}/createbusiness`,
  adminAuth,
  BusinessPurposeController.upload,
  BusinessPurposeController.createBusiness
);

router.put(
  `${adminPrefix}/editbusiness/:id`,
  adminAuth,
  BusinessPurposeController.upload,
  BusinessPurposeController.editBusiness
);

router.delete(
  `${adminPrefix}/deletebusiness/:id`,
  adminAuth,
  BusinessPurposeController.deleteBusiness
);

router.get("/getactiveusers", BusinessPurposeController.activeUsers);

router.get("/gethspabusinesses", BusinessPurposeController.hSpaBUsinesses);

router.get("/getmasseuseprofiles", BusinessPurposeController.masseuseProfiles);

router.get("/getsearchSpa/:searchName", SearchController.searchBySpaName);
router.get(
  "/getsearchMasseuse/:searchName",
  SearchController.searchByMasseuseName
);

router.get("/getsearchall/:searchName", SearchController.searchAll);

router.get(
  "/elastic/:from/:size/:searchName/:searchtype",
  SearchController.searchByElastic
);

router.get(
  "/elasticforum/:from/:size/:searchName",
  SearchController.searchByElasticForum
);

router.get(
  "/getspamasseuseforum/:from/:size/:forumtype",
  SearchController.getAllSpaMasseuseForumFunc
);

router.get(
  "/getspamasseuse/:from/:size/:type",
  SearchController.getAllSpaMasseuseFunc
);

router.get("/getforums/:from/:size", SearchController.getForms);
router.get(
  "/searchforumspamasseuse/:from/:size/:searchName",
  SearchController.searchForumSpaMasseuseRequest
);

// router.post(
//   `${adminPrefix}/image`,
//   uploadImage.single("img"),
//   async (req, res) => {
//     try {
//       if (!req.fileValidationError) {
//         console.log("image", req?.file?.filename);
//         let fileUrl = req?.file?.filename;

//         res.status(200).send({ img_url: fileUrl });
//       } else {
//         console.log("error");
//       }
//     } catch (err) {
//       console.log("error", err);
//       res
//         .status(503)
//         .send({ success: false, message: "Internal Server Error." });
//     }
//   }
// );

//GET IMAGES
// router.get("/download", function (req, res) {
//   console.log("IN GET IMAGE");
//   const file = `../backend/app/uploadedImages`;
//   //console.log("IN GET IMAGE")
//   res.download(file); // Set disposition and send it.
// });

// router.get("/download", async (req, res) => {
//   console.log("IN GET IMAGE");
//   try {
//     const files = await promises.readdir(`../backend/app/uploadedImages`);
//     console.log(files);

//     res.status(200).json(files);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// upload Images
router.post("/upload-image", upload.array("files", 10), async (req, res) => {
  try {
    if (req?.files?.length) {
      console.log(req.files);
      let uploadedFiles = req?.files?.map((image) => {
        return { img: image.filename };
      });
      res.status(200).send({
        success: true,
        messsage: "Files Uploaded",
        data: uploadedFiles,
      });
    } else {
      console.log("Something is missing.");
      res.status(400).send({ success: false, messsage: "Send Files." });
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, messsage: "Server Error." });
  }
});

// get all cities
router.get("/cities/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let citiesData;

    if (id === "all") {
      citiesData = await cities.findAll();
    } else {
      citiesData = await cities.findAll({
        where: {
          id,
        },
      });
    }
    //console.log("citiesData", citiesData);
    if (citiesData?.length) {
      res
        .status(200)
        .send({ success: true, messsage: "Data found.", data: citiesData });
    } else {
      res.status(200).send({
        success: false,
        messsage: "Data not found.",
        data: citiesData,
      });
    }
  } catch (err) {
    console.log("Error", err);
    res.status(503).send({ success: false, messsage: "Server Error." });
  }
});

router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/send-email", AuthController.sendEmail);
~router.post("/sign-up", AuthController.signUp);
router.post("/update-password", AuthController.updatePassword);
router.post("/resend-code", AuthController.resendCode);
router.post("/verify-code", AuthController.verifyCode);
router.get("/getSingleUser/:id", AuthController.getSingleUser);
router.post("/forgot-password", AuthController.forgotPassword);
router.get("/verifytoken/:token", AuthController.verifyToken);

router.use("/update-profile", userAuth);
router.put("/update-profile", AuthController.updateProfile);

// admin routers
router.post(`${adminPrefix}/login`, AdminAuthController.login);
router.post(`${adminPrefix}/logout`, AdminAuthController.logout);
router.post(`${adminPrefix}/sign-up`, AdminAuthController.signUp);
router.post(
  `${adminPrefix}/update-password`,
  AdminAuthController.updatePassword
);
router.post(`${adminPrefix}/resend-code`, AdminAuthController.resendCode);
router.post(`${adminPrefix}/verify-code`, AdminAuthController.verifyCode);
router.post(
  `${adminPrefix}/forgot-password`,
  AdminAuthController.forgotPassword
);
router.get(
  `${adminPrefix}/verifytoken/:token`,
  AdminAuthController.verifyToken
);

//spa routers
router.get(`${adminPrefix}/spas/:id`, adminAuth, SpaController.allSpas);
// router.get(`${adminPrefix}/spa/:id`, adminAuth, SpaController.singleSpa);
router.post(
  `${adminPrefix}/spa`,
  [
    adminAuth,
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  ],
  SpaController.addSpa
);
router.put(
  `${adminPrefix}/spa/:id`,
  [
    adminAuth,
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  ],
  SpaController.updateSpa
);

// get all users
router.get(`${adminPrefix}/users/:id`, adminAuth, Users.getAllUsers);

// delete user
router.delete(`${adminPrefix}/users/:id`, adminAuth, Users.deleteUser);

// admin delete multiple users
router.patch(`${adminPrefix}/multiple/delete/users`, Users.deleteMultipleUsers);

// approve spa
router.get(
  `${adminPrefix}/approve/spa/:id`,
  adminAuth,
  SpaController.approveSpa
);

// delete spa
router.delete(`${adminPrefix}/spa/:id`, adminAuth, SpaController.removeSpa);

// admin delete multiple spas
router.patch(
  `${adminPrefix}/multiple/delete/spa`,
  SpaController.deleteMultipleSpas
);

// get all masseuse
router.get(`${adminPrefix}/masseuse/:id`, adminAuth, Masseuse.allMasseuses);

// approve masseuse
router.get(
  `${adminPrefix}/approve/masseuse/:id`,
  adminAuth,
  Masseuse.approveMasseuse
);

// delete masseuse
router.delete(
  `${adminPrefix}/masseuse/:id`,
  adminAuth,
  Masseuse.removeMasseuse
);

// admin delete multiple masseuse
router.patch(
  `${adminPrefix}/multiple/delete/masseuse`,
  Masseuse.deleteMultipleMasseuse
);

//services routers
router.get(`${adminPrefix}/services`, adminAuth, Services.allServices);
router.get(`${adminPrefix}/services/:id`, adminAuth, Services.singleServices);
router.post(`${adminPrefix}/services`, adminAuth, Services.addService);
router.put(`${adminPrefix}/services/:id`, adminAuth, Services.updateService);
router.delete(`${adminPrefix}/services/:id`, adminAuth, Services.removeService);

//get my added spa services routers
router.get(`/spa/services/:id`, SpaService.allSpaService);
router.get(`/spa/servicesbyUser/:id`, userAuth, SpaService.allSpaServicebyUser);
// router.get(`/spa/services/:id`, userAuth, SpaService.singleSpaService);

// user add spa information
router.post(`/spa/services`, userAuth, SpaService.addSpaService);

// get spa Child
router.get(`/spa/getSpaChild/:id`, SpaService.geSpaChild);

// user update spa information
router.put(`/spa/services/:id`, userAuth, SpaService.updateSpaService);

// user delete apa information
router.delete(`/spa/services/:id`, userAuth, SpaService.removeSpaService);

// get all approved spas
router.get(`/approved/spas/:id`, SpaService.getApprovedSpas);

// add views for spa
router.put("/views/spas/:id", SpaService.addViews);

// user add Massseuse
router.post(`/masseuse/services`, userAuth, Masseuse.addMasseuse);

// get my added Massseuse
router.get(`/masseuse/services/:id`, Masseuse.getMasseuse);
router.get(
  `/masseuse/servicesbyUser/:id`,
  userAuth,
  Masseuse.getMasseuseByUser
);

// update my added Masseuse
router.put(`/masseuse/services/:id`, userAuth, Masseuse.updateMasseuse);

// get parant of masseuse
router.get(`/masseuse/getMasseuseParant/:id`, Masseuse.getMasseuseParant);

// delete my added Masseuse
router.delete(`/masseuse/services/:id`, userAuth, Masseuse.removeMasseuse);

// get all approved masseuse
router.get(`/approved/masseuse/:id`, Masseuse.getApprovedMasseuse);

// add views for masseuses
router.put("/views/masseuse/:id", Masseuse.addViews);

//spa masseuse routers
router.get(`/spa/masseuse`, SpaMasseuse.allSpaMasseuse);
router.get(`/spa/masseuse/:id`, SpaMasseuse.singleSpaMasseuse);
router.post(`/spa/masseuse`, adminAuth, SpaMasseuse.addSpaMasseuse);
router.put(`/spa/masseuse/:id`, adminAuth, SpaMasseuse.updateSpaMasseuse);
router.delete(`/spa/masseuse/:id`, adminAuth, SpaMasseuse.removeSpaMasseuse);

//spa review rating
router.get(`/spa/reviewrating`, ReviewRatingSpa.allReviewRatingSpa);
router.get(`/spa/reviewrating/:id`, ReviewRatingSpa.singleReviewRatingSpa);
router.post(`/spa/reviewrating/`, userAuth, ReviewRatingSpa.addReviewRatingSpa);
router.put(`/spa/reviewrating/:id`, ReviewRatingSpa.updateReviewRatingSpa);
router.delete(`/spa/reviewrating/:id`, ReviewRatingSpa.removeReviewRatingSpa);

//masseuse review rating
router.get(
  `/masseuse/reviewrating`,
  ReviewRatingMasseuse.allReviewRatingMasseuse
);
router.get(
  `/masseuse/reviewrating/:id`,
  ReviewRatingMasseuse.singleReviewRatingMasseuse
);
router.post(
  `/masseuse/reviewrating`,
  userAuth,
  ReviewRatingMasseuse.addReviewRatingMasseuse
);
router.put(
  `/masseuse/reviewrating/:id`,
  ReviewRatingMasseuse.updateReviewRatingMasseuse
);
router.delete(
  `/masseuse/reviewrating/:id`,
  ReviewRatingMasseuse.removeReviewRatingMasseuse
);

//forum
router.get(`/forum/updateviews/:id/:type`, SpaForum.elasticForumViewUpdate);
router.get(`/forum/allforums`, ForumController.allForum);
router.post("/forum/addgenericforum", ForumController.addGenericForum);
router.get(`/forum/spa`, SpaForum.allSpaForum);
router.get(`/forum/spa/:id/:forumId`, SpaForum.singleSpaForum);
router.post(`/forum/spa`, SpaForum.addSpaForum);
router.put(`/forum/spa/:id`, SpaForum.updateSpaForum);
router.delete(`/forum/spa/:id/:elasticID`, SpaForum.removeSpaForum);
router.get(`/forum/masseuse`, MasseuseForum.allMasseuseForum);
router.get(`/forum/masseuse/:id/:forumId`, MasseuseForum.singleMasseuseForum);
router.post(`/forum/masseuse`, MasseuseForum.addMasseuseForum);
router.put(`/forum/masseuse/:id`, MasseuseForum.updateMasseuseForum);
router.delete(`/forum/masseuse/:id`, MasseuseForum.removeMasseuseForum);

//comments
router.get(`/comment/spa`, SpaComment.allSpaComment);
router.get(`/comment/spa/:id`, SpaComment.singleSpaComment);
router.post(`/comment/spa`, userAuth, SpaComment.addSpaComment);
router.put(`/comment/spa/:id`, SpaComment.updateSpaComment);
router.delete(
  `/comment/spa/:id/:forumId/:elasticID`,
  SpaComment.removeSpaComment
);
router.get(`/comment/masseuse`, MasseuseComment.allMasseuseComment);
router.get(
  `/forum/comment/masseuse/:id`,
  MasseuseComment.singleForumMasseuseComment
);
router.get(`/comment/masseuse/:id`, MasseuseComment.singleMasseuseComment);
router.post(`/comment/masseuse`, userAuth, MasseuseComment.addMasseuseComment);
router.put(`/comment/masseuse/:id`, MasseuseComment.updateMasseuseComment);
router.delete(`/comment/masseuse/:id`, MasseuseComment.removeMasseuseComment);

router.get(`/useractivity`, userAuth, UserActivityController.getUserActivities);
router.get(`/stats`, BusinessEntityStats);

module.exports = router;
