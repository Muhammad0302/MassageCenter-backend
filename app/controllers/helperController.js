
const User = require("../models/User");
const Spa = require("../models/Spa");
const Masseuse = require("../models/Masseuse");
const sequelize = require("../../config/database");

exports.BusinessEntityStats = async (req, res) => {
    const userCount = await User.count({ where: { isDeleted: 0 } })
    const spaCount = await Spa.count({ where: { isDeleted: 0 } })
    const masseuseCount = await Masseuse.count({ where: { isDeleted: 0 } })
    

    res.send({ userCount, spaCount, masseuseCount})
}