const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Admin = sequelize.define(
  "admin",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    code: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    indexes: [
      // Create a unique index on email
      {
        unique: true,
        fields: ["email"],
      },
    ],
  }
);

module.exports = Admin;
