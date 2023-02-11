const multer = require("multer");
const uniqid = require("uniqid");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "app/upload/Advertise");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + uniqid() + path.extname(file.originalname));
  },
});

const advertise = multer({
  storage: storage,
}).single("advertise");
module.exports = advertise;
