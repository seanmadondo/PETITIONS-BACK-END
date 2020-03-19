const db = require('../../config/db');
const fs = require('mz/fs');
const passwords = require('../passwords');
const randomToken = require('rand-token');

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

exports.findUser = async function(user) {
    //Function to check User exists in the dataBase. Checking by Email, return user's password if found
    console.log('Checking if User exists....');
    const conn = await db.getPool().getConnection();
    const findUserSQL = 'SELECT user_id, password FROM User WHERE email = ?';

    try {
        const [result] = await conn.query(findUserSQL, [user.email]);
        console.log(result);
        console.log(result.length);
        if (result === [] || result === null || result.length === 0) {
            return [];
        } else {
            let userFound = result[0];
            return {
                'userId': userFound.user_id,
                'password': userFound.password,
            }
        }
    } catch(err) {
        console.error(`An error occurred when executing: \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
};

exports.login = async function (userId) {
    console.log('Request to login User....');
    const conn = await db.getPool().getConnection();

    const loginSQL = 'UPDATE User SET auth_token = ? WHERE user_id = ?';
    const token = randomToken.generate(32);
    try {
        await conn.query(loginSQL, [token, userId]);
        return {
            'userId' : userId,
            'token' : token
        }
    } catch (err) {
        console.error(`An error occurred when executing: \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
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

