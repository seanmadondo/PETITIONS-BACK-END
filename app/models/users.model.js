const db = require('../../config/db');
const fs = require('mz/fs');
const randomtoken = require('rand-token');

const photoDirectory = './storage/photos/';
const defaultPhotoDirectory = './storage/default/';

exports.register = async function (c_name, c_email, c_password, c_city,c_country) {
    console.log('Request to register a user to the database.....');
    const conn = await db.getPool().getConnection();
    const query = 'insert into users (name, email, password, city, country) values (?, ?, ?, ?, ?)';
    const [result] = await conn.query(query, [c_name, c_email, c_password, c_city=NULL, c_country=NULL]);
    conn.release();
    return result;
};

exports.login = async function (userID) {
    console.log('Request to login User....');
    const loginSQL = 'UPDATE User SET auth_token = ? WHERE user_id = ?';
    const token = randomtoken.generate(32);
    
};


exports.logout = async function () {



};

exports.retrieve = async function (id) {
    console.log(`Request to retrieve user ${id} from the database...`);
    const conn = await db.getPool().getConnection();
    const query = 'select * from User where user_id = ?';
    const [rows] = await conn.query(query, [id]);
    conn.release();
    return rows;
};

exports.change = async function () {


};

