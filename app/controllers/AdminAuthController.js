const bcrypt = require("bcryptjs");
const validator = require("validator");
const Admin = require("../models/Admin");
const adminSession = require("../models/AdminSession");
const sendMail = require("../helpher/sendMail");
const {
  verifyAdminEmailVerificationToken,
  createAdminEmailVerificationToken,
  createAdminAccessToken,
} = require("../helpher/jwtFunctions");

console.log("in admin ");
const createAdminToken = async (admin) => {
  const token = createAdminAccessToken(admin.id, admin.email);
  const session = await new adminSession({
    userId: admin.id,
    accessToken: token,
  });
  if (session) {
    var sessionSaved = await session
      .save()
      .then(() => {
        admin.dataValues.accessToken = token;
        return admin;
      })
      .catch((err) => {
        console.log("err while creating session", err);
        return -1;
      });
    return sessionSaved;
  }
  // save user token
};
exports.login = (req, res, next) => {
  const validationErrors = [];
  const { email, password } = req.body;
  console.log("in admin login");
  console.log(req.body);
  if (password && email) {
    if (!validator.isEmail(email)) {
      validationErrors.push("Please enter a valid email address.");
    }
    if (validator.isEmpty(password)) {
      validationErrors.push("Password cannot be blank.");
    }
  } else {
    validationErrors.push("Email and Password are required.");
  }
  if (validationErrors.length) {
    res.status(400).send({
      success: false,
      message: "Issue in data which is being send",
      data: validationErrors,
    });
  }
  Admin.findOne({
    where: {
      email: email,
    },
  })
    .then((admin) => {
      if (admin) {
        console.log(admin.dataValues);
        if (admin.dataValues.isVerified) {
          bcrypt
            .compare(password, admin.password)
            .then(async (doMatch) => {
              if (doMatch) {
                var updatedUserObj = await createAdminToken(admin);
                if (updatedUserObj != -1 && updatedUserObj) {
                  res.status(200).send({
                    success: true,
                    message: "Successful login",
                    data: updatedUserObj,
                  });
                } else {
                  res.status(400).send({
                    success: false,
                    message: "failed to create session token",
                  });
                }
                //});
              } else {
                res.status(400).send({
                  success: false,
                  message: "Invalid email or password",
                });
              }
            })
            .catch((err) => {
              console.log(err);
              res.status(400).send({
                success: false,
                message: "Sorry! Somethig went wrong.",
              });
            });
        } else {
          res.status(400).send({
            success: false,
            message: "Email is not verified.",
          });
        }
      } else {
        res.status(400).send({
          success: false,
          message: "No user found with this email.",
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.logout = (req, res, next) => {
  const validationErrors = [];
  const { userId } = req.body;
  if (validator.isEmpty(userId)) {
    validationErrors.push("userId is required.");
  }
  if (validationErrors.length) {
    res.status(400).send({
      success: false,
      message: "Issue in data which is being send",
      data: validationErrors,
    });
  }
  adminSession
    .findOne({
      where: {
        userId,
      },
    })
    .then((session) => {
      if (!session) {
        res.status(400).send({
          success: false,
          message: "No session found against the userId",
        });
      } else {
        session.destroy();
        res.status(200).send({
          success: true,
          message: "Logout successful",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send({
        success: false,
        message: err,
      });
    });
};

exports.signUp = async (req, res, next) => {
  const validationErrors = [];
  const { email, password, firstName, lastName } = req.body;

  console.log("Users");
  console.log(req.body);
  if (password && email && firstName && lastName) {
    if (
      validator.isEmpty(password) ||
      validator.isEmpty(firstName) ||
      validator.isEmpty(lastName)
    ) {
      validationErrors.push("Email, Username and Password are required.");
    } else {
      if (!validator.isEmail(email)) {
        validationErrors.push("Please enter a valid email address.");
      }
    }
    const userEmailExist = await Admin.findOne({
      where: {
        email,
      },
    });
    if (userEmailExist) {
      res.status(200).send({
        success: false,
        message: "Email already exist",
      });
    }

    if (validationErrors.length) {
      res.status(400).send({
        success: false,
        message: "Issue with data being send",
        data: validationErrors,
      });
    } else {
      bcrypt
        .hash(password, 12)
        .then(async (hashedPassword) => {
          const createUser = await Admin.create({
            
            password: hashedPassword,
            firstName,
            email,
            lastName,
          });

          res.status(200).send({
            success: true,
            message: "Your signup successfully",
            data: createUser,
          });
        })
        .catch((err) => console.log(err));
    }
  } else {
    res.status(400).send({
      success: false,
      message: "Issue with data being send",
      data: validationErrors,
    });
  }
};

exports.forgotPassword = (req, res, next) => {
  const validationErrors = [];
  const { email } = req.body;

  if (!validator.isEmail(email)) {
    validationErrors.push("Please enter a valid email address.");
  }
  if (validationErrors.length) {
    res.status(400).send({
      success: false,
      message: "Issue with data being send",
      data: validationErrors,
    });
  }
  Admin.findOne({
    where: {
      email: email,
    },
  })
    .then(async (user) => {
      if (!user) {
        res.status(400).send({
          success: false,
          message: "No user found with this email.",
        });
      } else {
        try {
          const code = Math.floor(1000 + Math.random() * 9000);
          sendMail(email, code, 2, user.firstName, user.lastName);
          user
            .update({ code })
            .then((userObj) => {
              res.status(200).send({
                success: true,
                message: "Forgot passowrd email sent",
              });
            })
            .catch((error) => {
              res.status(400).send({
                success: false,
                message: `Something went worng ${error}`,
              });
            });
        } catch (error) {
          res.status(400).send({
            success: false,
            message: `Issue sending email ${error}`,
          });
        }
      }
    })

    .catch((err) => {
      console.log(err);
    });
};

exports.resendCode = (req, res, next) => {
  const validationErrors = [];
  const { email } = req.body;

  if (!validator.isEmail(email)) {
    validationErrors.push("Please enter a valid email address.");
  }
  if (validationErrors.length) {
    res.status(400).send({
      success: false,
      message: "Issue with data being send",
      data: validationErrors,
    });
  }
  Admin.findOne({
    where: {
      email: email,
    },
  })
    .then(async (user) => {
      if (!user) {
        res.status(400).send({
          success: false,
          message: "No user found with this email.",
        });
      } else {
        try {
          const code = Math.floor(1000 + Math.random() * 9000);
          sendMail(email, code, 3);
          user
            .update({ code })
            .then((userObj) => {
              res.status(200).send({
                success: true,
                message: "Email for forgot password sent",
              });
            })
            .catch((error) => {
              res.status(400).send({
                success: false,
                message: `Something went worng ${error}`,
              });
            });
        } catch (error) {
          res.status(400).send({
            success: false,
            message: `Issue sending mail ${error}`,
          });
        }
      }
    })

    .catch((err) => {
      console.log(err);
    });
};

exports.verifyCode = (req, res, next) => {
  const validationErrors = [];
  const { email, code } = req.body;

  if (!validator.isEmail(email)) {
    validationErrors.push("Please enter a valid email address.");
  }
  if (validationErrors.length) {
    res.status(400).send({
      success: false,
      message: "Issue with data being send",
      data: validationErrors,
    });
  }
  Admin.findOne({
    where: {
      email: email,
    },
  })
    .then(async (user) => {
      if (!user) {
        res.status(400).send({
          success: false,
          message: "No user found with this email.",
        });
      } else {
        if (user.code == code) {
          res.status(400).send({
            success: true,
            message: "Valid code.",
          });
        } else {
          res.status(400).send({
            success: false,
            message: "Invalid code.",
          });
        }
      }
    })

    .catch((err) => {
      console.log(err);
    });
};

exports.updatePassword = (req, res, next) => {
  const validationErrors = [];
  const { email, password } = req.body;

  if (!validator.isEmail(email)) {
    validationErrors.push("Please enter a valid email address.");
  }
  if (validationErrors.length) {
    res.status(400).send({
      success: false,
      message: "Issue with data being send",
      data: validationErrors,
    });
  }
  Admin.findOne({
    where: {
      email: email,
    },
  })
    .then(async (user) => {
      if (!user) {
        res.status(400).send({
          success: false,
          message: "No user found with this email.",
        });
      } else {
        var hashedPassword = await bcrypt.hash(password, 12);
        console.log("hashedPassword", hashedPassword);
        user
          .update({
            password: hashedPassword,
            code: null,
          })
          .then((result) => {
            console.log(result);
            res.status(200).send({
              success: true,
              message: "Password updated successfully",
            });
          })
          .catch((err) => {
            res.status(400).send({
              success: false,
              message: "Failed to update password successfully",
            });
          });
      }
    })

    .catch((err) => {
      console.log(err);
    });
};

exports.verifyToken = (req, res, next) => {
  const { token } = req.params;
  if (token) {
    try {
      const decoded = verifyAdminEmailVerificationToken(token);
      console.log(decoded);
      Admin.findOne({
        where: {
          email: decoded.email,
        },
      })
        .then((user) => {
          if (user) {
            user
              .update({ isVerified: 1 })
              .then((result) => {
                return res.status(200).send({
                  success: true,
                  message: "Token verified",
                  data: decoded,
                });
              })
              .catch((error) => {
                return res.status(400).send({
                  success: false,
                  message: `Something went wrong ${error}`,
                });
              });
          } else {
            res.status(400).send({ success: false, message: "No user found" });
          }
        })
        .catch((error) => {
          return res.status(400).send({
            success: false,
            message: `Something went wrong ${error}`,
          });
        });
    } catch (error) {
      console.log(error);
      return res.status(400).send({
        success: false,
        message: "URL has expired",
      });
    }
  }
};
