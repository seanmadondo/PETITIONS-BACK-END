const user = require('../models/users.photos.model');
const authenticator = require('../authenticator');

exports.retrieve = async function (req, res) {
    console.log("Request to retrieve a photo from the database.....");


};

exports.set = async function (req, res) {
    console.log("Request to update a photo in the database.....")


};

exports.delete = async function (req, res) {
    console.log("Request to delete a photo in the database.....");
    const userId = req.params.id;
    const userAuthKey = req.header("X-Authorization");
    const fileExt = req.header('Content-Type');

    const userExists = await authenticator.checkIdExists(userId);
    const userAuthenticated = await authenticator.checkAuthToken(userAuthKey);

    if (userExists === 1) {
        if (userAuthenticated === 1) {
            const photoDeleted = await user.deletePhoto(userId);

        } else {
            res.status(401)
                .send("You're not authenticated!");
        }
    } else {
        res.status(404)
            .send("No such user exists!");
    }



};