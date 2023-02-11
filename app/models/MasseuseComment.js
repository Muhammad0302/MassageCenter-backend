const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("./User");
const MasseuseForum = require("./MasseuseForum");
const Forum = require("./Forums");
const MasseuseComment = sequelize.define("spacomment", {
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
MasseuseComment.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
  sourcekey: "userId",
});
MasseuseComment.belongsTo(Forum, {
  foreignKey: "forumId",
  targetKey: "id",
  sourcekey: "forumId",
});

Forum.hasMany(MasseuseComment, { foreignKey: "forumId" });
MasseuseComment.hasMany(MasseuseComment, {
  as: "Replies",
  foreignKey: "parentId",
  allowNull: true,
});
MasseuseComment.belongsTo(MasseuseComment, {
  as: "MasseuseComment",
  foreignKey: "parentId",
});
module.exports = MasseuseComment;
