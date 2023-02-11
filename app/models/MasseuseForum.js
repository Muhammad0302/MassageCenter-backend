const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("./User");
const Masseuse = require("./Masseuse");
const MasseuseForum = sequelize.define("masseuseforum", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: true,
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
});
MasseuseForum.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
  sourcekey: "userId",
});
MasseuseForum.belongsTo(Masseuse, {
  foreignKey: "masseuseId",
  targetKey: "id",
  sourcekey: "masseuseId",
});
module.exports = MasseuseForum;
