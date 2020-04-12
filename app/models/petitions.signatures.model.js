const db = require('../../config/db');
const fs = require('mz/fs');
const petition = require("../models/petitions.model");

const photoDirectory = './storage/photos/';
const defaultPhotoDirectory = './storage/default/';

exports.retrieveSignature = async function (id) {
    console.log(">>> Executing retrieveSignature.....");
    const conn = await db.getPool().getConnection();
    const getSignSQL = "SELECT signatory_id, signed_date FROM Signature WHERE petition_id = ? ORDER BY signed_date ASC";

    try {
        const [results] = await conn.query(getSignSQL, [id]);
        conn.release();
        let resultsList = [];

        for (let i = 0; i < results.length; i++) {
            let userDetails = await getAuthorDetails(results[i].signatory_id);
            resultsList.push ({
                "signatoryId": results[i].signatory_id,
                "name": userDetails[0],
                "city": userDetails[1],
                "country": userDetails[2],
                "signedDate": results[i].signed_date
            })
        }
        return resultsList;

    } catch (err) {
        console.error(`An error occurred when executing retrieveSignature : \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }

};


exports.signPetition = async function (authId, petitionId, dateToday) {
    console.log(">>> Executing signPetition.....");
    const conn = await db.getPool().getConnection();
    const signSQL = "INSERT INTO Signature (signatory_id, petition_id, signed_date) VALUES (?,?,?)";
    let info = [authId, petitionId, dateToday];

    try {
        await conn.query(signSQL, info);
        conn.release();

    } catch (err) {
        console.error(`An error occurred when executing signPetition : \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }


};


exports.removeSignature = async  function() {

};

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//HELPER FUNCTIONS

//Function to get author details and assist retrieve signature Function
getAuthorDetails = async function(petitionId) {
    const conn = await db.getPool().getConnection();

    //Get the author of the petition_id given
    const authId = await petition.getAuthIdByPetition(petitionId);
    const getDataSQL = "SELECT name, city, country FROM User WHERE user_id = ?";

    try{
        const [results] = await conn.query(getDataSQL, [authId]);
        conn.release();

        return [results[0].name, results[0].city, results[0].country];

    } catch (err) {
        console.error(`An error occurred when executing getAuthorDetails : \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }

};
