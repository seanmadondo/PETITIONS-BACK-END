const petitions = require('../models/petitions.model');

exports.view = async function(req, res){
    console.log("\n>>> Request to view a Petition.....");
    const startIndex = req.params.startIndex;
    const count = req.params.count;
    const string = req.params.string;
    const categoryId = req.params.categoryId;
    const authorId = req.params.authorId;
    const sortBy = req.params.sortBy;

    if (!(startIndex in req.params && count in req.params && string in req.params && categoryId in req.params && authorId in req.params && sortBy in req.params)) {
        try {
            const petitionInfo = await petitions.getPetitions();
            res.statusMessage = "Success"
            res.status(200)
                .json(petitionInfo);
        } catch (err) {
            res.status(500)
                .send(`ERROR Viewing Petition: ${err}`);
        }
    }
};

exports.add = async function(req, res){


};

exports.retrieve = async function(req, res){


};

exports.change = async function(req, res){



};

exports.delete = async function(req, res){



};

exports.retrieveCat = async function(req, res){



};

