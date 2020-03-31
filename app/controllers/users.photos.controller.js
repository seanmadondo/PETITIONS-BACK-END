const user_photo = require('../models/users.photos.model');
const authenticator = require('../authenticator');
const appTools = require('../appTools');


exports.retrieve = async function (req, res) {
    console.log("Request to retrieve a photo from the database.....");
    const userId = req.params.id;

    try {
        const filename = await user_photo.getPhotoFilename(userId);
        if (filename === null) {
            res.statusMessage = 'Not Found';
            res.status(404)
                .send();
        } else {
            const imageRetrieved = await user_photo.getPhoto(filename);
            res.statusMessage = "OK";
            res.status(200)
                .contentType(imageRetrieved.mimeType)
                .send(imageRetrieved.image);
        }
    } catch (err) {
        if (!err.hasBeenLogged) console.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500)
            .send();
    }
};



exports.set = async function (req, res) {
    console.log("Request to update a photo in the database.....");
    const userId = req.params.id;
    const userAuthKey = req.header("X-Authorization");

    //Check that the user exists
    const userExists = await authenticator.checkIdExists(userId);
    if (userExists !== 1) {
        res.statusMessage = "Not Found!";
        res.status(404)
            .send();
        return;
    }

    //Check the user is authenticated
    const isAuthenticated = await authenticator.checkIdByAuthToken(userId, userAuthKey);

    if (isAuthenticated !== true) {
        res.statusMessage = "Forbidden";
        res.status(403)
            .send();
        return;
    }

    // Check photo file extension
    const getFileExtension = appTools.getImageExtension(req.header('Content-Type'));
    if (getFileExtension === null) {
        res.statusMessage = 'Bad Request: type must be image/jpeg OR image/png OR image/gif';
        res.status(400)
            .send();
        return;
    }

    //Check user doesnt already have a profile photo
    try {
        const photoExists = await user_photo.getPhotoFilename(userId);
        if (photoExists) {
            res.status(201)
                .send();
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR setting user Photo: ${err}`);
    }

};

exports.delete = async function (req, res) {
    console.log("Request to delete a photo in the database.....");
    const userId = req.params.id;
    const userAuthKey = req.header("X-Authorization");

    const userExists = await authenticator.checkIdExists(userId);
    //Check the user Exists
    if (userExists !== 1) {
        res.statusMessage = 'User Not Found';
        res.status(404)
            .send();
        return;
    }

    //Check the user is authenticated to delete this photo
    const isAuthenticated = await authenticator.checkIdByAuthToken(userId, userAuthKey);
    if (isAuthenticated !== true) {
        res.statusMessage = 'Forbidden';
        res.status(401)
            .send();
    } else {
        try {
            const photoFilename = await user_photo.getPhotoFilename(userId);
            if (photoFilename == null) {
                res.statusMessage = 'Not Found';
                res.status(404)
                    .send();
            } else {
                await Promise.all([
                    user_photo.deletePhoto(photoFilename),
                    user_photo.updatePhoto(userId, null)
                ]);
                res.statusMessage = "Deleted OK";
                res.status(200)
                    .send();
            }
        } catch (err) {
            if (!err.hasBeenLogged) console.error(err);
            res.statusMessage = 'Internal Server Error';
            res.status(500)
                .send();
        }
    }
};