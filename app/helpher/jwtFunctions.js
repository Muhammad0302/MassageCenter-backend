const jwt = require("jsonwebtoken");
const verifyEmailVerificationToken = (token) => {
  console.log("in verifyEmailVerificationToken");
  try {
    const decoded = jwt.verify(token, process.env.JWT_VERIFY_TOKEN_KEY);
    console.log(decoded, "decoded");
    return decoded;
  } catch (err) {
    return err;
  }
};
const verifyAdminEmailVerificationToken = (token) => {
  console.log("in verifyAdminEmailVerificationToken");
  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_VERIFY_TOKEN_KEY);
    console.log(decoded, "decoded");
    return decoded;
  } catch (err) {
    return err;
  }
};
const verifyAccessToken = (token) => {
  //console.log('in verifyAccessToken');
  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN_KEY);
    return decoded;
  } catch (err) {
    return { error: true };
  }
};
const createAccessToken = (id, email) => {
  console.log("in createAccessToken", id, email);
  return jwt.sign({ id, email }, process.env.JWT_TOKEN_KEY, {
    // expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

const verifyAdminAccessToken = (token) => {
  console.log("in verifyAdminAccessToken");
  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_TOKEN_KEY);
    return decoded;
  } catch (err) {
    return err;
  }
};
const createAdminAccessToken = (id, email) => {
  console.log("in createAdminAccessToken", id, email);
  return jwt.sign({ id, email }, process.env.ADMIN_JWT_TOKEN_KEY, {
    // expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};
const createEmailVerificationToken = (email) => {
  console.log("in createEmailVerificationToken");
  return jwt.sign({ email }, process.env.JWT_VERIFY_TOKEN_KEY, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};
const createAdminEmailVerificationToken = (email) => {
  console.log("in createAdminEmailVerificationToken");
  return jwt.sign({ email }, process.env.ADMIN_JWT_VERIFY_TOKEN_KEY, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};
module.exports = {
  verifyEmailVerificationToken,
  verifyAccessToken,
  createAccessToken,
  createEmailVerificationToken,
  createAdminAccessToken,
  verifyAdminAccessToken,
  verifyAdminEmailVerificationToken,
  createAdminEmailVerificationToken,
};
