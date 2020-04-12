const petitions = require('../models/petitions.model');
const user = require('../models/users.model');
const authenticator = require('../authenticator');
const tools = require('../appTools');

exports.view = async function(req, res){
    console.log("\n>>> Request to view a Petition.....");


    if ("startIndex" in req.query || "count" in req.query || "q" in req.query || "categoryId" in req.query || "authorId" in req.query || "sortBy" in req.query) {
        try {
            let petitionInfo = await petitions.getFilteredPetitions(req.query);
            res.statusMessage = "Success";
            res.status(200)
                .json(petitionInfo);

        } catch (err) {
            res.status(500)
                .send(`ERROR Viewing Filtered Petitions: ${err}`);
        }
    } else {
        try {
            const petitionInfo = await petitions.getAllPetitions();
            res.statusMessage = "Success";
            res.status(200)
                .json(petitionInfo);
        } catch (err) {
            res.status(500)
                .send(`ERROR Viewing All Petitions: ${err}`);
        }
    }
};

exports.add = async function(req, res){
    console.log("\n>>> Request to add a petition......");
    const authToken = req.header("X-Authorization");

    //Check to see if title is included in the body
    if (!("title" in req.body)) {
        res.statusMessage = "Invalid title";
        res.status(400)
            .send();
    }

    const categoryId = req.body.categoryId;
    const checkCatExists = await petitions.getCatName(categoryId);
    if (!(checkCatExists)) {
        res.statusMessage = "Invalid category";
        res.status(400)
            .send();
    }

    //Check today's date and compare with given date.
    let today = new Date();
    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + " " + time;

    if ("closingDate" in req.body) {
        if (req.body.closingDate <= dateTime) {
            res.statusMessage = "Invalid Closing date!";
            res.status(400)
                .send();
        }
    }

    //Check to see if user has included auth token
    if (authToken === "") {
        res.statusMessage = "Unauthorised!";
        res.status(401)
            .send();
    }

    //Get the userId from the authToken given
    const authId = await authenticator.getUserFromAuth(authToken);
    if (authId) {
        //Post the petition
        try {
            const petitionId = await petitions.postPetition(req.body, authId, dateTime);
            res.statusMessage = "Success!";
            res.status(201)
                .json({petitionId});
        } catch (err) {
            res.status(500)
                .send(`ERROR Posting Petition: ${err}`);
        }
    } else {
        res.statusMessage = "Provided Token could not be authorised";
        res.status(401)
            .send();
    }

};

exports.retrieveOne = async function(req, res){
    console.log("\n>>> Request to get detailed information about a petition........");


    //Check if petition Exists.
    const checkPetition = await petitions.checkPetitionExists(req.params.id)
    if (checkPetition === 0) {
        res.statusMessage = "Not Found";
        res.status(404)
            .send();
        return;
    }
    try {
        const getPetition = await petitions.getOnePetition(req.params.id);
        res.statusMessage = "Success";
        res.status(200)
            .json(getPetition);
    } catch (err) {
        res.status(500)
            .send(`ERROR Retrieving a Petition: ${err}`);
    }

};

exports.change = async function(req, res){
    console.log("\n>>>Request to change a petition......");
    const authToken = req.header("X-Authorization");

    //Check if this petition exists...
    const checkPetition = await petitions.checkPetitionExists(req.params.id)
    if (checkPetition === 0) {
        res.statusMessage = "Not Found";
        res.status(404)
            .send();
        return;
    }

    //Check closingDate is in the future...
    if ("closingDate" in req.body) {
        if (req.body.closingDate <= tools.getDateTimeToday()) {
            res.statusMessage = "Bad Request";
            res.status(400)
                .send();
            return;
        }
    }

    //check category exists if given
    if ("categoryId" in req.body) {
        const categoryId = req.body.categoryId;
        const checkCatExists = await petitions.getCatName(categoryId);
        if (!(checkCatExists)) {
            res.statusMessage = "Invalid category";
            res.status(400)
                .send();
            return;
        }
    }

    //check that this petition has an author_id that matches with user_id of the editor
    const authorOfPetition = await petitions.getAuthIdByPetition(req.params.id);
    const getUserIdFromToken = await authenticator.getUserFromAuth(authToken);
    if (authorOfPetition === getUserIdFromToken) {
        //check petition is not closed
        const petitionDetails = await petitions.getOnePetition(req.params.id);
        if (!(petitionDetails.closingDate < tools.getDateTimeToday())) {
            try {
                await petitions.alterPetition(req.params.id,req.body);
                res.statusMessage = "OK";
                res.status(200)
                    .send();
            } catch (err) {
                res.status(500)
                    .send(`ERROR Changing a Petition: ${err}`);
            }
        } else {
            res.statusMessage = "Bad Request: Petition is closed";
            res.status(400)
                .send();
        }
    } else {
        res.statusMessage = "Forbidden";
        res.status(403)
            .send();
    }
};

exports.delete = async function(req, res){
    console.log("\n>>> Request to delete a Petition.....");
    const authToken = req.header("X-Authorization");

    //Check if this petition exists...
    const checkPetition = await petitions.checkPetitionExists(req.params.id)
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

    //check that this petition has an author_id that matches with user_id of the editor
    const authorOfPetition = await petitions.getAuthIdByPetition(req.params.id);
    const getUserIdFromToken = await authenticator.getUserFromAuth(authToken);
    if (authorOfPetition === getUserIdFromToken) {
        try {
            await petitions.deletePetition(req.params.id);
            res.statusMessage = "OK";
            res.status(200)
                .send();
        } catch (err) {
            res.status(500)
                .send(`ERROR Deleting a Petition: ${err}`);
        }
    } else {
        res.statusMessage = "Forbidden";
        res.status(403)
            .send();
    }
};

exports.getCategories = async function(req, res){
    console.log("\n>>> Request to get data about Petition Categories....");

    try {
        const categories = await petitions.retrieveCategories();
        res.statusMessage = "OK";
        res.status(200)
            .json(categories);
    } catch (err) {
        res.status(500)
            .send(`ERROR Retrieving Categories: ${err}`);
    }
};
