const db = require('../../config/db');
const fs = require('mz/fs');

const photoDirectory = './storage/photos/';
const defaultPhotoDirectory = './storage/default/';

const bcrypt = require('bcrypt');

exports.getPetitions = async function () {
    console.log(">>> Now getting petitions from the database.....");
    const conn = await db.getPool().getConnection();
    const getPetitionsSQL = "SELECT petition_id, title, category_id, author_id FROM Petition";

    try {
        const [results] = await conn.query(getPetitionsSQL);
        conn.release();
        let petitionResults = [];

        for (let i = 0; i < results.length; i++) {
            let authAndCat = await getCatAndAuth(results[i].category_id, results[i].author_id);
            petitionResults.push({
                "petitionId": results[i].petition_id,
                "title": results[i].title,
                "category": authAndCat[1],
                "authorName": authAndCat[0],
                "signatureCount": await numSignatures(results[i].petition_id)
            })
        }
        return petitionResults;

    } catch (err) {
        console.error(`An error occurred when executing getPetitions : \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
};

exports.postPetition = async function () {



};

exports.getOnePetition = async function () {




};

exports.alterPetition = async function () {




};

exports.deletePetition = async function () {



};


exports.retrievePetitions = async function () {



};

//_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+
//=============================================== HELPER FUNCTIONS =================================================
//_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+

//Get the number of signatures given the petition ID
numSignatures = async function (petitionId) {
    //console.log('>>> Now getting the number of signatures.......');
    const conn = await db.getPool().getConnection();
    const getSignatureSQL = "SELECT * FROM Signature WHERE petition_id = ?";

    try {
        const [result] = await conn.query(getSignatureSQL, [petitionId]);
        conn.release();
        return result.length;
    } catch (err) {
        console.error(`An error occurred when executing numSignatures : \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
};

//Function to return the string names of category and author given the id numbers
getCatAndAuth = async function (categoryId, authorId) {
    //console.log('>>> Getting the category and author strings.....');
    const conn = await db.getPool().getConnection();
    const getAuthSQL = "SELECT name FROM User WHERE user_id = ?";
    const getCatSQL = "SELECT name FROM Category WHERE category_id = ?";
    try {
        const [auth] = await conn.query(getAuthSQL, [authorId]);
        const [category] = await conn.query(getCatSQL, [categoryId]);
        conn.release();

        return [auth[0].name, category[0].name]; //Returns a [AuthorName, CategoryName] List.

    } catch (err) {
        console.error(`An error occurred when executing getCatAndAuth : \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
};