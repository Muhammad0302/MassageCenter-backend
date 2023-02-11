// const { DataTypes } = require('sequelize');
// const sequelize = require('../../config/database');
// const Spa = require('../models/Spa');
// const Masseuse = require('../models/Masseuse');
// const SpaMasseuse = sequelize.define('SpaMasseuse', {
// 	id: {
// 		type: DataTypes.INTEGER,
// 		autoIncrement: true,
// 		allowNull: false,
// 		primaryKey: true,
// 	},
// 	isDeleted: {
// 		type: DataTypes.BOOLEAN,
// 		defaultValue: false,
// 		allowNull: false,
// 	},
// });
// SpaMasseuse.belongsTo(Spa, {
// 	foreignKey: 'spaId',
// 	targetKey: 'id',
// 	sourcekey: 'spaId',
// 	onDelete: 'CASCADE',
// });
// SpaMasseuse.belongsTo(Masseuse, {
// 	foreignKey: 'masseuseId',
// 	targetKey: 'id',
// 	sourcekey: 'masseuseId',
// 	onDelete: 'CASCADE',
// });
// module.exports = SpaMasseuse;
