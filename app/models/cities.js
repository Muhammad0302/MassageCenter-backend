const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');


const cities = sequelize.define(
	'cities',
	{
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		isDeleted: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
	},
);


module.exports = cities;
