const validator = require("validator");
const SpaForum = require("../models/SpaForum");
const Comment = require("../models/Comments");
const Forum = require("../models/Forums");
const { Sequelize } = require("sequelize");
const Op = Sequelize.Op;
const elasticSearch = require("../helpher/elasticsearch");
const User = require("../models/User");

exports.allForum = (req, res, next) => {
  Forum.findAll({
    // attributes: [
    //   [Sequelize.literal("COUNT(DISTINCT(forumId))"), "countOfProducts"],
    // ],
    // attributes: [Sequelize.fn("COUNT", Sequelize.col("forumId")), "forumId"],

    // attributes: {
    //   include: [
    //     [Sequelize.fn("COUNT", Sequelize.col("comments.forumId")), "count"],
    //   ],
    // },
    where: {
      isDeleted: 0,
      //   spaId: {
      //     [Op.eq]: null,
      //   },
      //   masseuseId: {
      //     [Op.eq]: null,
      //   },
    },

    //right query
    include: [
      {
        model: Comment,
        as: "comments",

        // attributes: [[Sequelize.fn("COUNT", "forumId"), "items"]],
        include: [
          {
            model: User,
            attributes: ["userName"],
          },
          {
            model: Comment,
            as: "Replies",
            include: { model: User, attributes: ["userName"] },
          },
        ],
        //include: { model: User, attributes: ["userName"] },
      },
    ],
    order: [["no_comments", "DESC"]],
  })
    .then((masseuse) => {
      res.status(200).send({
        success: true,
        message: "Generic Forum fetched successfully",
        data: masseuse,
      });
    })
    .catch((err) => {
      console.log("ERRROR is ", err);
      res.status(400).send({
        success: false,
        message: `issue fetching data ${err}`,
        err,
      });
    });
};

exports.addGenericForum = (req, res, next) => {
  const validationErrors = [];
  const { topic, userId, description, comments, elasticID } = req.body;
  // if (validator.isEmpty(userId)) {
  // 	validationErrors.push('userId is required.');
  // }
  // if (validator.isEmpty(masseuseId)) {
  // 	validationErrors.push('masseuseId is required.');
  // }
  // if (validator.isEmpty(topic)) {
  // 	validationErrors.push('topic is required.');
  // }

  if (validationErrors.length) {
    res.status(400).send({
      success: false,
      message: "Issue with data being send",
      data: validationErrors,
    });
  } else {
    Forum.create({
      topic,
      userId,
      description,
      isDeleted: 0,
    })
      .then(async (masseuse) => {
        //masseuse?.dataValues["comments"] = comments;
        //console.log("comments is ", comments);
        console.log("comments data is ", { masseuse, comments });
        //masseuse.forumtype = elasticID;
        let forumtype = elasticID;
        //obj["forumtype"] = elasticID;
        await elasticSearch.addForum(`${elasticID}_${masseuse.id}`, {
          masseuse,
          comments,
          forumtype,
        });

        res.status(200).send({
          success: true,
          message: "Generic Forum added successfully",
          data: masseuse,
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
