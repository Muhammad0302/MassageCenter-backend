const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('../models/User');
const Masseuse = require('../models/Masseuse');
const ReviewRatingMasseuse = sequelize.define('reviewratingmasseuse', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	},
	review: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	rating: {
		type: DataTypes.INTEGER,
		allowNull: true,
	},
	isDeleted: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
		allowNull: false,
	},
});
ReviewRatingMasseuse.belongsTo(User, {
	foreignKey: 'userId',
	targetKey: 'id',
	sourcekey: 'userId',
});
ReviewRatingMasseuse.belongsTo(Masseuse, {
	foreignKey: 'masseuseId',
	targetKey: 'id',
	sourcekey: 'masseuseId',
});

Masseuse.hasMany(ReviewRatingMasseuse, { foreingKey: "masseuseId" });
module.exports = ReviewRatingMasseuse;
