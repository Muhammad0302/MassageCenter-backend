const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("../models/User");
const Spa = require("../models/Spa");
const Masseuse = require("../models/Masseuse");
const Forum = sequelize.define(
  "Forum",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    no_comments: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {}
);
Forum.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
  sourcekey: "userId",
});
Forum.belongsTo(Spa, {
  foreignKey: "spaId",
  targetKey: "id",
  sourcekey: "spaId",
});
Forum.belongsTo(Masseuse, {
  foreignKey: "masseuseId",
  targetKey: "id",
  sourcekey: "masseuseId",
});
module.exports = Forum;
