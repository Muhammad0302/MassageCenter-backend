const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Images = sequelize.define("images", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Images;
