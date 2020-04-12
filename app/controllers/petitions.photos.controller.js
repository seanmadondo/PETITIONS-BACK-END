const petitionPhoto = require('../models/petitions.photos.model');
const petition = require("../models/petitions.model");
const tools = require("../appTools");
const authenticate = require("../authenticator");

exports.retrieve = async function (req, res) {
    console.log("\n>>> Request to retrieve a Petition photo from the database.....");
    const petitionId = req.params.id;

    //Check if this petition exists
    const checkPetitionExists = await petition.checkPetitionExists(petitionId);
    if (checkPetitionExists === 0) {
        res.statusMessage = 'Not Found';
        res.status(404)
            .send();
        return;
    }

    try {
        const filename = await petitionPhoto.getPetitionPhotoFilename(petitionId);
        //console.log(filename);
        if (filename === null) {
            res.statusMessage = 'Not Found!';
            res.status(404)
                .send();
        } else {
            const imageRetrieved = await petitionPhoto.retrievePhoto(filename);
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
    console.log("\n>>> Request to set a petition photo.....");
    const image = req.body;
    const petitionId = req.params.id;
    const authToken = req.header("X-Authorization");


    //Check if this petition exists
    const checkPetitionExists = await petition.checkPetitionExists(petitionId);
    if (checkPetitionExists === 0) {
        res.statusMessage = 'Not Found!';
        res.status(404)
            .send();
        return;
    }

    //Check to see if user has included auth token
    if (authToken === "") {
        res.statusMessage = "Unauthorised!";
        res.status(403)
            .send();
        return;
    }

    // Check photo file extension
    const getFileExtension = tools.getImageExtension(req.header('Content-Type'));
    if (getFileExtension == null) {
        res.statusMessage = 'Bad Request: type must be image/jpeg OR image/png OR image/gif';
        res.status(400)
            .send();
        return;
    }

    //check that this petition has an author_id that matches with user_id of the editor
    const authorOfPetition = await petition.getAuthIdByPetition(req.params.id);
    const getUserIdFromToken = await authenticate.getUserFromAuth(authToken);
    if (authorOfPetition === getUserIdFromToken) {
        try {
            //Check petition doesnt already have a photo
            const photoExists = await petitionPhoto.getPetitionPhotoFilename(petitionId);
            if (photoExists) {
                await petitionPhoto.deletePhoto(photoExists);
            }
            const filename = await petitionPhoto.setPhoto(image, getFileExtension);
            await petitionPhoto.setPetitionPhotoFilename(petitionId, filename);
            if (photoExists) {
                res.statusMessage = 'OK';
                res.status(200)
                    .send();
            } else {
                res.statusMessage = 'Created';
                res.status(201)
                    .send();
            }
        } catch (err) {
            res.status(500)
                .send(`ERROR setting petition photo: ${err}`);
        }
    } else {
            res.statusMessage = "Forbidden";
            res.status(401)
                .send();
    }
};