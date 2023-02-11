const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("../models/User");
const cities = require("../models/cities");

const Masseuse = sequelize.define("masseuse", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  specialization: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  image: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hourOfOpertaion: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  instagram: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otherInfo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  facebook: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  twitter: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  services: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  comment: {
    type: DataTypes.TEXT("long"),
    allowNull: true,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
});

User.hasMany(Masseuse, { foreingKey: "UserId" });
Masseuse.belongsTo(User, { foreingKey: "UserId" });

module.exports = Masseuse;
