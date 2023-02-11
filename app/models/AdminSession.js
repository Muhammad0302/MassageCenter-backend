const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Admin = require('../models/Admin');
const adminSession = sequelize.define('adminSessions', {
	id: {
		// type: DataTypes.STRING,
		// primaryKey: true,
		type: DataTypes.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	},
	// userId: {
	// 	type: DataTypes.STRING,
	// 	allowNull: false,
	// },
	expires: {
		type: DataTypes.DATE,
		allowNull: true,
	},
	accessToken: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
	refreshToken: {
		type: DataTypes.TEXT,
		allowNull: true,
	},
});
adminSession.belongsTo(Admin, {
	foreignKey: 'userId',
	targetKey: 'id',
	sourcekey: 'userId',
});
module.exports = adminSession;
