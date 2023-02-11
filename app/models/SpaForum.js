const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("../models/User");
const Spa = require("../models/Spa");
const SpaForum = sequelize.define(
  "spaforum",
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
  },
  {}
);
SpaForum.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
  sourcekey: "userId",
});
SpaForum.belongsTo(Spa, {
  foreignKey: "spaId",
  targetKey: "id",
  sourcekey: "spaId",
});
module.exports = SpaForum;
