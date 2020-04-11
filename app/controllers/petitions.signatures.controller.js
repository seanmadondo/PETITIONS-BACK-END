const petitionSignature = require('../models/petitions.signatures.model');

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


};

exports.remove = async function (req, res) {


};