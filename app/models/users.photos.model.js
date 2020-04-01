const db = require('../../config/db');
const fs = require('mz/fs');
const appTools = require('../appTools');
const photoDirectory = './storage/default/';
const randomToken = require('rand-token');


exports.getPhoto = async function (filename) {
    console.log("Executing getPhoto model function.....");
    try {
        if (await fs.exists(photoDirectory + filename)) {
            const image = await fs.readFile(photoDirectory + filename);
            const mimeType = appTools.getImageMimetype(filename);
            return {image, mimeType};
        } else {
            return null
        }
    } catch (err) {
        console.error(`An error occurred when executing getPhoto : \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
};

exports.updatePhoto = async function (image, imageExtension) {
    const filename = randomToken.generate(32) + imageExtension;
    try {
        await fs.writeFile(photoDirectory + filename, image);
        return filename;
    } catch (err) {
        console.error(`An error occurred when executing updatePhoto : \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
        fs.unlink(photoDirectory + filename)
            .catch(err => console.error(err));
        throw err;
    }
};

exports.deletePhoto = async function (filename, id) {
    console.log("Request to delete Photo... deletePhoto function executing....");
    const conn = await db.getPool().getConnection();
    const deletePhotoSQL = "UPDATE User SET photo_filename = NULL WHERE user_id = ?";
    try {
        await conn.query(deletePhotoSQL, [id]);
        conn.release();

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

exports.setPhotoFilename = async function (userId, filename) {
    console.log("Update user photo filename.....");
    const conn = await db.getPool().getConnection();
    const setPhotoSQL = "UPDATE User SET photo_filename = ? WHERE user_id = ?";

    try {
        const [result]  = await conn.query(setPhotoSQL, [filename, userId]);
        conn.release();
        if (result.changedRows !== 1) {
            throw Error("Only one user's photo should be modified");
        }
    } catch(err) {
        console.error(`An error occurred when executing setPhotoFilename: \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
};