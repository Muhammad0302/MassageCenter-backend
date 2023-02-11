const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const Masseuse = require("../models/Masseuse");
const Spa = require("../models/Spa");

const spaMessause = sequelize.define(
  "spaMessause",
  {
    spaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    masseuseId: {
      type: DataTypes.INTEGER,
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
spaMessause.belongsTo(Spa, {
  foreignKey: "spaId",
  sourceKey: Spa.id,
});
Spa.hasMany(spaMessause, {
  foreignKey: "spaId",
  sourceKey: Spa.id,
});

spaMessause.belongsTo(Masseuse, {
  foreignKey: "masseuseId",
  sourceKey: Masseuse.id,
});
Masseuse.hasMany(spaMessause, {
  foreignKey: "masseuseId",
  sourceKey: Masseuse.id,
});

module.exports = spaMessause;
