const db = require('../../config/db');
const fs = require('mz/fs');

const photoDirectory = './storage/photos/';
const defaultPhotoDirectory = './storage/default/';

exports.getPhoto = async function () {

};

exports.updatePhoto = async function () {



};

exports.deletePhoto = async function () {
    console.log("Request to delete Photo... deletePhoto function executing....");
    const conn = await db.getPool().getConnection();
    const deletePhotoSQL = "UPDATE "
};