const UserActivity = require("../models/UserActivity");

exports.getUserActivities = (req, res) => {
  try {
    const userId = req.user;

    UserActivity.findAll({
      where: {
        userId,
      },
      order: [["createdAt", "DESC"]],
    })
      .then((activity) => {
        if (activity) {
          res.status(200).json({
            success: true,
            message: "Recent Activities are",
            recent_activity: activity,
          });
        } else {
          res.status(200).send({
            success: false,
            message: "No Recent Activities",
          });
        }
      })
      .catch((err) => {
        res.status(400).send({
          success: false,
          message: `issue fetching data ${err}`,
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
};
