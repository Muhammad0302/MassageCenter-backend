const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
// const User = require('../models/User');
// const Spa = require('../models/Spa');
const HomePage = sequelize.define(
  "homepage",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {}
);

module.exports = HomePage;
