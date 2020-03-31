const db = require('../../config/db');
const fs = require('mz/fs');
const appTools = require('../appTools');
const photoStorage = './storage/photos/';
const photoDirectory = './storage/default/';

exports.getPhoto = async function (filename) {
    console.log("\nNow getting photo from the database.....");
    try {
        if (await fs.exists(photoDirectory + filename)) {
            const image = await fs.readFile(photoDirectory + filename);
            const mimeType = appTools.getImageMimetype(filename);
            return { image, mimeType };
        } else {
            return null
        }
    } catch (err) {
        console.error(`An error occurred when executing getPhoto : \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
};

exports.updatePhoto = async function () {



};

exports.deletePhoto = async function (filename) {
    console.log("Request to delete Photo... deletePhoto function executing....");
    try {
        if (await fs.exists(photoDirectory + filename)) {
            fs.unlink(photoDirectory + filename);
        }
    } catch (err) {
        console.error(`An error occurred when executing deletePhoto : \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
};

//_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+
// HELPER FUNCTIONS

exports.getPhotoFilename = async function (userId) {
    console.log("Check if User has a photo already attached.....");
    const conn = await db.getPool().getConnection();
    const checkPhotoSQL = "SELECT photo_filename FROM User WHERE user_id = ?";

    try {
        const [result] = await conn.query(checkPhotoSQL, [userId]);
        conn.release();
        return result[0].photo_filename;
    } catch(err) {
        console.error(`An error occurred when executing checkPhotoExists: \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }

};