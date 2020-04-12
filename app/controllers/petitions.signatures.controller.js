const petitionSignature = require('../models/petitions.signatures.model');
const petition = require('../models/petitions.model');
const authenticator = require("../authenticator");
const tools = require('../appTools');

exports.retrieve = async function (req, res) {
    console.log("\n>>> Request to get signatures......");
    const signId = req.params.id;

    try {
        const signatureData = await petitionSignature.retrieveSignature(signId);
        res.statusMessage = "Success";
        res.status(200)
            .json(signatureData);
    } catch (err) {
        res.status(500)
            .send(`ERROR Retrieving a Petition Signature: ${err}`);
    }

};

exports.sign = async function (req, res) {
    console.log("\n>>> Request to sign a petition......");
    const petitionId = req.params.id;
    const authToken = req.header("X-Authorization");

    //Check if this petition exists...
    const checkPetition = await petition.checkPetitionExists(petitionId)
    if (checkPetition === 0) {
        res.statusMessage = "Not Found";
        res.status(404)
            .send();
        return;
    }

    //Check to see if user has included auth token
    if (authToken === "") {
        res.statusMessage = "Unauthorised!";
        res.status(401)
            .send();
        return;
    }

    //Check authToken validity
    const authId = await authenticator.getUserFromAuth(authToken);
    if (!(authId)) {
        res.statusMessage = "Unauthorised";
        res.status(401)
            .send();
        return;
    }


    //Check user hasn't already signed this petition
    const petitionSignatures = await petitionSignature.retrieveSignature(petitionId);
    for (let i = 0; i < petitionSignatures.length; i++) {
        if (petitionSignatures[i].signatoryId === authId) {
            res.statusMessage = "Forbidden";
            res.status(403)
                .send();
            return;
        }
    }

    //Proceed to sign the petition
    const dateToday = tools.getDateTimeToday(); // Today's time and date
    try {
        await petitionSignature.signPetition(authId, petitionId, dateToday);
        res.statusMessage = "Created";
        res.status(201)
            .send();

    } catch (err) {
        res.status(500)
            .send(`ERROR Signing a Petition : ${err}`);
    }

};

exports.remove = async function (req, res) {
    console.log("\n>>> Request to delete a petition......");
    const petitionId = req.params.id;
    const authToken = req.header("X-Authorization");

    //Check Petition Exists....
    const checkPetition = await petition.checkPetitionExists(petitionId);
    if (checkPetition === 0) {
        res.statusMessage = "Not Found";
        res.status(404)
            .send();
        return;
    }

    //Check if petition has closed...
    const currentPetition = await petition.getOnePetition(petitionId);
    if (currentPetition.closingDate < tools.getDateTimeToday()) {
        res.statusMessage = "Forbidden";
        res.status(403)
            .send();
        return;
    }

    //Check to see if user has included authToken
    if (authToken === "") {
        res.statusMessage = "Unauthorised!";
        res.status(401)
            .send();
        return;
    }

    //Check authToken validity
    const authId = await authenticator.getUserFromAuth(authToken);
    if (!(authId)) {
        res.statusMessage = "Unauthorised";
        res.status(401)
            .send();
        return;
    }

    //Get the petitions signatures, check if user has a signature in there
    let signatureExists = [];
    const petitionSignatures = await petitionSignature.retrieveSignature(petitionId);
    for (let i = 0; i < petitionSignatures.length; i++) {
        if (petitionSignatures[i].signatoryId === authId) {
            signatureExists.push(petitionSignatures[i]);
        }
    }

    if (signatureExists.length === 0) {
        res.statusMessage = "Forbidden";
        res.status(403)
            .send();
        return;
    }

    //else, go ahead and delete the petition...
    try {
        await petitionSignature.removeSignature(authId);
        res.statusMessage = "OK";
        res.status(200)
            .send();

    } catch (err) {
        res.status(500)
            .send(`ERROR Deleting a Petition : ${err}`);
    }
};