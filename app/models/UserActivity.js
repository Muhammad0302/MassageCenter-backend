const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("../models/User");

const UserActivity = sequelize.define(
  "useractivity",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    actiontype: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {}
);

User.hasMany(UserActivity, { foreingKey: "UserId" });
UserActivity.belongsTo(User, { foreingKey: "UserId" });

module.exports = UserActivity;
