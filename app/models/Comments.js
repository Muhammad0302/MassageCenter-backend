const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("./User");
const MasseuseForum = require("./MasseuseForum");
const Forum = require("./Forums");
const Comment = sequelize.define("comment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },

  mediaLink: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
});
Comment.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
  sourcekey: "userId",
});
Comment.belongsTo(Forum, {
  foreignKey: "forumId",
  targetKey: "id",
  sourcekey: "forumId",
});

Forum.hasMany(Comment, { foreignKey: "forumId" });
Comment.hasMany(Comment, {
  as: "Replies",
  foreignKey: "parentId",
  allowNull: true,
});
Comment.belongsTo(Comment, {
  as: "comments",
  foreignKey: "parentId",
});
module.exports = Comment;
