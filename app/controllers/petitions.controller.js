const petitions = require('../models/petitions.model');
const user = require('../models/users.model');
const authenticator = require('../authenticator');

exports.view = async function(req, res){
    console.log("\n>>> Request to view a Petition.....");


    if ("startIndex" in req.query || "count" in req.query || "q" in req.query || "categoryId" in req.query || "authorId" in req.query || "sortBy" in req.query) {
        try {
            const petitionInfo = await petitions.getAllPetitions();
            let filteredSet = new Set();

            //Filter out results.......
            if ("authorId" in req.query) {
                let authName = await user.getAuthName(req.query.authorId);
                for (let i = 0; i < petitionInfo.length; i++) {
                    if(authName === petitionInfo[i].authorName) {
                        filteredSet.add(petitionInfo[i]);
                    }
                }
            }
            if ("categoryId" in req.query) {
                let catName = await petitions.getCatName(req.query.categoryId);
                for (let i = 0; i < petitionInfo.length; i++) {
                    if (catName === petitionInfo[i].category) {
                        filteredSet.add(petitionInfo[i]);

                    }
                }
            }
            if ("q" in req.query) {
                for (let i = 0; i < petitionInfo.length; i++) {
                    let lowerCaseTitle = petitionInfo[i].title.toLocaleLowerCase();
                    if (lowerCaseTitle.includes(req.query.q.toLocaleLowerCase())) {
                        filteredSet.add(petitionInfo[i]);
                    }
                }
            }

            //Convert Set back to list after duplicates removed.
            let filteredList = Array.from(filteredSet);
            console.log(filteredList);

            //Sort the list by the given parameters......
            if ("sortBy" in req.query) {
                if (req.params.sortBy === "ALPHABETICAL_ASC") {

                } else if (req.params.sortBy === "ALPHABETICAL_DESC") {

                } else if (req.params.sortBy === "SIGNATURES_ASC") {

                } else {

                }
            }

            //Paginate with startIndex and Count.....


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

exports.retrieve = async function(req, res){


};

exports.change = async function(req, res){



};

exports.delete = async function(req, res){



};

exports.retrieveCat = async function(req, res){



};
