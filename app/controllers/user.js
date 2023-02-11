const users = require('../models/User');
const Masseuse = require('../models/Masseuse');
const spa = require('../models/Spa')

// get all users or single user
exports.getAllUsers = async ( req, res ) => {
    try{
        let usersData;
        let id = req.params.id;
        if( id === "all" ){
            usersData = await users.findAll({
                where: {
                    isDeleted: false
                },
                include: [
                    {
                        model: spa,
                        where: {
                            isDeleted: false
                        },
                        required: false
                    },
                    {
                        model: Masseuse,
                        where: {
                            isDeleted: false
                        },
                        required: false
                    }
                ]
            })
        } else if( id ){
            usersData = await users.findAll({
                where: {
                    id,
                    isDeleted: false
                },
                include: [
                    {
                        model: spa,
                        where: {
                            isDeleted: false
                        },
                        required: false
                    },
                    {
                        model: Masseuse,
                        where: {
                            isDeleted: false
                        },
                        required: false
                    }
                ]
            })
        }
        console.log("usersData", usersData)
        if( usersData?.length ){
            res.status(200).send({ success: true, message: "Data found.", data: usersData })
        } else {
            res.status(200).send({ success: false, message: "Data not found.", data: usersData })
        }
    } catch( err ){
        console.log("Error", err);
        res.status(503).send({ success: false, message: "Server Error." })
    }
}

// delete a user
exports.deleteUser = async ( req, res ) => {
    try{
        let id = req.params.id;
        if( id ){
            let deletedUser = await users.update(
                {
                    isDeleted: true
                },
                {
                    where: {
                        id
                    }
                }
            )
            console.log("deletedUser", deletedUser);
            if( deletedUser[0] > 0 ){
                res.status(200).send({ success: true, message: "User Deleted." })
            } else {
                res.status(200).send({ success: false, message: "Could not Delete User." })
            }
        } else {
            console.log("Something is missing.");
            res.status(400).send({ success: false, message: "Send Proper Data." })
        }
    } catch( err ){
        console.log("Error", err);
        res.status(503).send({ success: false, message: "Server Error" })
    }
}

// delete multiple users
exports.deleteMultipleUsers = async( req, res ) => {
	try{
		let ids = req.body.ids;
		console.log("Spa Ids", ids)
		if( ids?.length ){
			let deletedUsers = await users.update(
				{
					isDeleted: true
				},
				{
					where: {
						id: ids
					}
				}
			)
			console.log("deletedUsers", deletedUsers);
			if( deletedUsers[0] > 0 ){
				res.status(200).send({ success: true, message: "Users Deleted." })
			} else{
				res.status(200).send({ success: false, message: "not deleted." })
			}
		} else {
			console.log("Something is missing.");
			res.status(400).send({ success: false, message: "Send proper Data." })
		}
	} catch( err ){
		console.log("error", err)
		res.status(503).send({ success: false, message: "Server Error." })
	}	
}
