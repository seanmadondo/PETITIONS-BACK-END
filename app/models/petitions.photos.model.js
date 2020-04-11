const db = require('../../config/db');
const fs = require('mz/fs');
const appTools = require('../appTools');
const photoDirectory = './storage/default/';
const randomToken = require('rand-token');

exports.retrievePhoto = async function (filename) {
    console.log(">>> Executing retrievePhoto model function.....");

    try {
        if (await fs.exists(photoDirectory + filename)) {
            const image = await fs.readFile(photoDirectory + filename);
            const mimeType = appTools.getImageMimetype(filename);
            return {image, mimeType};
        } else {
            return null
        }
    } catch (err) {
        console.error(`An error occurred when executing retrievePhoto : \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
};

exports.setPhoto = async  function (image, imageExtension) {
    const filename = randomToken.generate(32) + imageExtension;
    try {
        await fs.writeFile(photoDirectory + filename, image);
        return filename;
    } catch (err) {
        console.error(`An error occurred when executing setPhoto : \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
        fs.unlink(photoDirectory + filename)
            .catch(err => console.error(err));
        throw err;
    }
};


exports.deletePhoto = async function (filename, id) {
    console.log("Request to delete Photo... deletePhoto function executing....");
    const conn = await db.getPool().getConnection();
    const deletePhotoSQL = "UPDATE Petition SET photo_filename = NULL WHERE petition_id = ?";
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

exports.getPetitionPhotoFilename = async function (id) {
    console.log(">>> Now getting petition photo filename from the database....");
    const conn = await db.getPool().getConnection();
    const checkPhotoSQL = "SELECT photo_filename FROM Petition WHERE petition_id = ?";

    try {
        const [result] = await conn.query(checkPhotoSQL, [id]);
        conn.release();
        return result[0].photo_filename;
    } catch(err) {
        console.error(`An error occurred when executing getPetitionPhotoFilename: \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
};


exports.setPetitionPhotoFilename = async function (id, filename) {
    console.log(">>> Now setting photo filename in database.....");
    const conn = await db.getPool().getConnection();
    const setPhotoSQL = "UPDATE Petition SET photo_filename = ? WHERE petition_id = ?";

    try {
        const [result]  = await conn.query(setPhotoSQL, [filename, id]);
        conn.release();
        if (result.changedRows !== 1) {
            throw Error("Only one user's photo should be modified");
        }
    } catch(err) {
        console.error(`An error occurred when executing setPetitionPhotoFilename: \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
};