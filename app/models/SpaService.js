const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Spa = require('../models/Spa');
const Service = require('../models/Services');
const SpaService = sequelize.define('SpaService', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	},
	isDeleted: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
		allowNull: false,
	},
});
SpaService.belongsTo(Spa, {
	foreignKey: 'spaId',
	targetKey: 'id',
	sourcekey: 'spaId',
	onDelete: 'CASCADE',
});
SpaService.belongsTo(Service, {
	foreignKey: 'serviceId',
	targetKey: 'id',
	sourcekey: 'serviceId',
	onDelete: 'CASCADE',
});
module.exports = SpaService;
