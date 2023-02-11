const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const User = sequelize.define(
	'users',
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true,
		},
		userName: {
			type: DataTypes.STRING,
			allowNull: true,
			unique:true
		},
		firstName: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		lastName: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		image: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		isVerified: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		code: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		isDeleted: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		phoneNumber: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		location: {
			type: DataTypes.STRING,
			allowNull: true,
		}
	},
	{
		indexes: [
			// Create a unique index on email
			{
				unique: true,
				fields: ['email'],
			},
		],
	}
);

module.exports = User;
