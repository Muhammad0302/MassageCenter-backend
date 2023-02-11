const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
// const User = require('../models/User');
// const Spa = require('../models/Spa');
const Businesspurpose = sequelize.define(
  "businesspurpose",
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
// ReviewRatingSpa.belongsTo(User, {
// 	foreignKey: 'userId',
// 	targetKey: 'id',
// 	sourcekey: 'userId',
// });
// ReviewRatingSpa.belongsTo(Spa, {
// 	foreignKey: 'spaId',
// 	targetKey: 'id',
// 	sourcekey: 'spaId',
// });
// Spa.hasMany(ReviewRatingSpa, { foreingKey: "spaId" });

module.exports = Businesspurpose;
