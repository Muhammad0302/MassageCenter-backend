const bcrypt = require("bcryptjs");
const validator = require("validator");
require("dotenv").config();
const User = require("../models/User");
const userSession = require("../models/UserSession");
const sendMail = require("../helpher/sendMail");
const {
  verifyEmailVerificationToken,
  createEmailVerificationToken,
  createAccessToken,
} = require("../helpher/jwtFunctions");
const path = require("path");

exports.AdvertiseFunction = (req, res) => {
  try {
    const { business, email, atu, loginemail } = req.body;

    let sampleFile;
    let uploadPath;
    console.log("req.body is ", req.body);

    console.log("File mimetype is ", req.files.sampleFile.mimetype);

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded.");
    }

    if (
      req.files.sampleFile.mimetype == "application/pdf" ||
      req.files.sampleFile.mimetype == "application/vnd.rar" ||
      req.files.sampleFile.mimetype == "application/zip"
    ) {
      sampleFile = req.files.sampleFile;
      uploadPath = path.join(__dirname, "../"); //It goes three folders or directories back from given __dirname.
      console.log("path ", uploadPath);
      //let extensionfile = sampleFile.name.split(".").pop();
      let extensionfile = sampleFile.name.replace(/\s/g, "");
      console.log("Extension file is ", extensionfile);
      sampleFile.name = Date.now() + "_" + extensionfile;
      uploadPath = uploadPath + "/upload/advertise/" + sampleFile.name;
      console.log("Directory is ", uploadPath);
      sampleFile.mv(uploadPath, function (err) {
        if (err) {
          console.log("In error");
          return res.status(500).send(err);
        } else {
          console.log("here ", req.body);
          console.log("Sample file name is ", sampleFile.name);
          let fileurl = `${process.env.SERVER_URL}/files/advertise/${sampleFile.name}`;
          sendMail(email, 1234, 4, business, fileurl, atu, loginemail);
          res.status(200).send({
            success: true,
            messsage: "Advertise email sent",
            business,
            email,
            fileurl,
            atu,
          });
        }
      });
    } else {
      return res
        .status(400)
        .send("Uploaded file format not correct,upload pdf,zip or rar");
    }
  } catch (error) {
    res.status(400).send({
      success: false,
      message: `Issue sending email ${error}`,
    });
  }
};

const createToken = async (user) => {
  const token = createAccessToken(user.id, user.email);
  const session = await new userSession({
    userId: user.id,
    accessToken: token,
  });
  if (session) {
    var sessionSaved = await session
      .save()
      .then(() => {
        user.dataValues.accessToken = token;
        return user;
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
  console.log("user login");

  const validationErrors = [];
  const { email, password } = req.body;
  console.log(email);
  console.log(password);
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
  User.findOne({
    where: {
      email: email,
    },
  })
    .then((user) => {
      if (user) {
        if (user.dataValues.isVerified) {
          bcrypt
            .compare(password, user.password)
            .then(async (doMatch) => {
              if (doMatch) {
                var updatedUserObj = await createToken(user);
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
                message: "Sorry, somethig went wrong",
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
  userSession
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

exports.sendEmail = (req, res, next) => {
  const validationErrors = [];
  const { email } = req.body;
  if (email) {
    if (!validator.isEmail(email)) {
      validationErrors.push("Please enter a valid email address.");
    }

    if (validationErrors.length) {
      console.log("error occur at line 165");
      res.status(400).send({
        success: false,
        message: "Issue with data being send",
        data: validationErrors,
      });
    } else {
      User.findOne({
        where: {
          email,
        },
      })
        .then((user) => {
          if (!user) {
            User.create({
              email,
            })
              .then((data) => {
                const token = createEmailVerificationToken(email);
                sendMail(email, token, 1);
                res.status(200).send({
                  success: true,
                  message:
                    "A link has been sent to your registered email address for verification. Click the link in your inbox to complete sign up.",
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
            const token = createEmailVerificationToken(email);
            sendMail(email, token, 1);
            res.status(200).send({
              success: true,
              message: "Email already exist",
            });

            // const token = createEmailVerificationToken(email);
            // sendMail(email, token, 1);
            // res.status(200).send({
            //   success: true,
            //   message:
            //     "Email exists, A link has been resent to your registered email address for verification. Click the link in your inbox to complete sign up.",
            // });
          }
        })
        .catch((err) => {
          res.status(400).send({
            success: false,
            message: err,
          });
        });
    }
  } else {
    res.status(400).send({
      success: false,
      message: "Issue with data being send",
      data: validationErrors,
    });
  }
};

// exports.signUp = (req, res, next) => {
// 	const validationErrors = [];
// 	const { username, email, password, firstName, lastName } = req.body;

// 	console.log(req.body);
// 	if (username && password && email && firstName && lastName) {
// 		if (
// 			validator.isEmpty(password) ||
// 			validator.isEmpty(username) ||
// 			validator.isEmpty(firstName) ||
// 			validator.isEmpty(lastName)
// 		) {
// 			validationErrors.push('Email, Username and Password are required.');
// 		} else {
// 			if (!validator.isEmail(email)) {
// 				validationErrors.push('Please enter a valid email address.');
// 			}
// 		}
// 		if (validationErrors.length) {
// 			res.status(400).send({
// 				success: false,
// 				message: 'Issue with data being send',
// 				data: validationErrors,
// 			});
// 		} else {
// 			User.findOne({
// 				where: {
// 					email,
// 				},
// 			})
// 				.then((user) => {
// 					if (user) {
// 						bcrypt.hash(password, 12).then(async (hashedPassword) => {
// 							user
// 								.update(
// 									{
// 										username,
// 										password: hashedPassword,
// 										firstName,
// 										lastName,
// 									},
// 									{ where: { email } }
// 								)
// 								.then((data) => {
// 									res.status(200).send({
// 										success: true,
// 										message: 'User signed up =)',
// 										data: data,
// 									});
// 								})
// 								.catch((err) => {
// 									res.status(400).send({
// 										success: false,
// 										message: err,
// 									});
// 								});
// 						});
// 					} else {
// 						res.status(400).send({
// 							success: false,
// 							message: 'Email exists ',
// 						});
// 					}
// 				})
// 				.catch((err) => console.log(err));
// 		}
// 	} else {
// 		res.status(400).send({
// 			success: false,
// 			message: 'Issue with data being send',
// 			data: validationErrors,
// 		});
// 	}
// };

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
  User.findOne({
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
  User.findOne({
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
  User.findOne({
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
          res.status(200).send({
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
  User.findOne({
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
      const decoded = verifyEmailVerificationToken(token);
      console.log(decoded);
      User.findOne({
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

exports.signUp = async (req, res, next) => {
  const validationErrors = [];
  const { userName, email, password } = req.body;

  console.log("Users");
  console.log(req.body);
  if (userName && password && email) {
    if (validator.isEmpty(password) || validator.isEmpty(userName)) {
      validationErrors.push("Email, Username and Password are required.");
    } else {
      if (!validator.isEmail(email)) {
        validationErrors.push("Please enter a valid email address.");
      }
    }
    const userEmailExist = await User.findOne({
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

    const userExist = await User.findOne({
      where: {
        userName,
      },
    });
    if (userExist) {
      res.status(200).send({
        success: false,
        message: "user name already exist",
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
          const createUser = await User.create({
            userName,
            password: hashedPassword,

            email,
          });
          if (createUser) {
            const token = createEmailVerificationToken(email);
            sendMail(email, token, 1);

            res.status(200).send({
              success: true,
              message:
                "A link has been sent to your registered email address for verification. Click the link in your inbox to complete sign up.",
              data: createUser,
            });
          }
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

exports.updateProfile = async (req, res) => {
  try {
    let userId = req?.user;
    console.log("userId", userId);
    let { email, location, userName, phoneNumber } = req.body;
    let password = req?.body?.password;
    if (email && location && userName && phoneNumber && userId) {
      const originalUser = await User.findOne({ where: { id: userId } });
      if (userName !== originalUser.userName) {
        const userExist = await User.findOne({ where: { userName } });
        if (userExist) {
          return res
            .status(400)
            .send({ success: false, message: "Username already exist." });
        }
      }

      if (email !== originalUser.email) {
        const emailExist = await User.findOne({ where: { email } });
        if (emailExist) {
          return res
            .status(400)
            .send({ success: false, message: "Email already exist." });
        }
      }

      let updatedProfile;
      if (password) {
        let hashedPassword = bcrypt.hashSync(
          password,
          parseInt(process.env.BCRYPT_SALT)
        );
        updatedProfile = await User.update(
          {
            email,
            location,
            userName,
            phoneNumber,
            password: hashedPassword,
          },
          {
            where: {
              id: userId,
            },
          }
        );
      } else {
        updatedProfile = await User.update(
          {
            email,
            location,
            userName,
            phoneNumber,
          },
          {
            where: {
              id: userId,
            },
          }
        );
      }
      console.log("updatedProfile", updatedProfile);
      if (updatedProfile[0] > 0) {
        let userData = await User.findOne({
          where: {
            id: userId,
          },
        });
        res
          .status(200)
          .send({ success: true, message: "Profile Updated", data: userData });
      } else {
        res.send({ success: false, message: "profile could not update" });
      }
    } else {
      console.log("something is missing");
      res.status(400).send({ success: false, message: "Send Proper Data." });
    }
  } catch (err) {
    console.log("error", err);
    res.status(503).send({ success: false, message: "Server Error." });
  }
};


exports.getSingleUser = async (req, res) => {
  const { id } = req.params;
  User.findOne({ where: { id } })
    .then((user) => {
      res.status(200).send({
        success: true,
        message: "parant fetch Successfully",
        data: user,
      });
    })
    .catch((err) => {
      res.status(400).send({
        success: false,
        message: `Something went worng ${err}`,
      });
    });
};
