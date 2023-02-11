const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("../models/User");
const SpaForum = require("../models/SpaForum");
const Spa = require("../models/Spa");
const Forum = require("../models/Forums");
const SpaComment = sequelize.define("spacomments12", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  // parentId: {
  // 	type: DataTypes.INTEGER,
  // 	allowNull: true,
  // },
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
SpaComment.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
  sourcekey: "userId",
});
SpaComment.belongsTo(Forum, {
  foreignKey: "forumId",
  targetKey: "id",
  sourcekey: "forumId",
});
Forum.hasMany(SpaComment, { foreignKey: "forumId" });
SpaComment.hasMany(SpaComment, {
  as: "Replies",
  foreignKey: "parentId",
  allowNull: true,
});
SpaComment.belongsTo(SpaComment, { as: "SpaComment", foreignKey: "parentId" });

SpaComment.belongsTo(Spa, {
  foreignKey: "spaId",
  targetKey: "id",
  sourcekey: "spaId",
});

module.exports = SpaComment;
