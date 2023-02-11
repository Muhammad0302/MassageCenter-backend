const {
  verifyAccessToken,
  verifyAdminAccessToken,
} = require("../helpher/jwtFunctions");
userAuth = (req, res, next) => {
  const token = req.headers?.authorization?.split(" ")[1];
  // console.log(token);
  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      //console.log("verified", decoded);
      if (decoded?.error) {
        console.log("Error");
        res.status(401).send({
          success: false,
          message: "token expired",
        });
      } else {
        req.user = decoded.id;
        next();
      }
    } catch (err) {
      return res.status(401).send({
        success: false,
        message: "User unauthorized..",
      });
    }
  } else {
    return res.status(401).send({
      success: false,
      message: "User unauthorized",
    });
  }
};
adminAuth = (req, res, next) => {
  const token = req.headers?.authorization?.split(" ")[1];
  console.log(token);
  if (token) {
    try {
      const decoded = verifyAdminAccessToken(token);
      req.user = decoded.id;
      next();
    } catch (err) {
      return res.status(401).send({
        success: false,
        message: "User unauthorized..",
      });
    }
  } else {
    return res.status(401).send({
      success: false,
      message: "User unauthorized",
    });
  }
};
module.exports = {
  userAuth,
  adminAuth,
};
