const db = require('../../config/db');
const fs = require('mz/fs');
const passwords = require('../passwords');
//const randomtoken = require('rand-token');

const photoDirectory = './storage/photos/';
const defaultPhotoDirectory = './storage/default/';

exports.register = async function (user) {
    console.log('Request to register a user to the database.....');
    const conn = await db.getPool().getConnection();
    const insertQuery = 'insert into User (name, email, password, city, country) values (?, ?, ?, ?, ?)';

    //User values to enter into database
    const userData = [
        user.name,
        user.email,
        await passwords.hash(user.password),
        null,
        null,
    ];

    //Add City and Country if necessary
    if ('city' in user) {
        userData[3] = user.city;
    }
    if ('country' in user) {
        userData[4] = user.country;
    }

    //Check email does not already exist on DB
    const emailQuery = 'select * from User where email = ?';
    const [emailStatus] = await conn.query(emailQuery, [user.email]);
    if ( emailStatus !== '') {
        try {
            const [result] = await conn.query(insertQuery, userData);
            conn.release();
            return result.insertId;
        } catch(err) {
            console.error(`An error occurred when executing: \n${err.sql} \nERROR: ${err.sqlMessage}`);
            err.hasBeenLogged = true;
        }
    } else {
        const result = -1;
        return result;
    }
};

exports.login = async function (userID) {
    console.log('Request to login User....');
    const loginSQL = 'UPDATE User SET auth_token = ? WHERE user_id = ?';
    //const token = randomtoken.generate(32);
    
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

