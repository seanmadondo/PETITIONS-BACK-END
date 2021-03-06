//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
//_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+ SUPPORT FUNCTIONS BELOW _+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_//
//============================================================================================================//
const db = require('../config/db');

// _+_+_+_++_+_+_Check if ID exists in the database _+_+_+__+_+_+_+_+_+_+_
exports.checkIdExists = async function(user_id) {
    console.log("Checking if this User exists");
    const conn = await db.getPool().getConnection();
    const getIdSQL = "SELECT * FROM User WHERE user_id = ?";
    try {
        const [result] = await conn.query(getIdSQL, [user_id]);
        conn.release();
        if (result === [] || result.length === 0) {
            return 0;                   //false - No User like this in the database!
        } else {
            return 1;                   //true - A User like this exists!
        }
    } catch (err) {
        console.error(`An error occurred when executing: \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
};

//+_+_+_+_+_+_+_+ FUNCTION TO CHECK ID BY AUTH _+_+_+_+_+_+_+_+_+_+_
exports.checkIdByAuthToken = async function(id, authId) {
    console.log("Check authToken against ID");
    const conn = await db.getPool().getConnection();
    const findAuthToken = 'SELECT auth_token FROM User WHERE user_id = ?';
    try {
        const [result] = await conn.query(findAuthToken, [id]);
        conn.release();
        if (result[0].auth_token.toString() === authId) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.error(`An error occurred when executing checkIdByAuthToken: \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
};

//_+_+_+_+_+++_++_+_+_+  Check Auth token exists +_+_+_+_+_++_+_+_+_+_+_+_+_+
exports.checkAuthToken = async function(authId) {
    console.log("\nCheck if user auth token exists.....");
    const conn = await db.getPool().getConnection();
    const findAuthToken = 'SELECT user_id FROM User WHERE auth_token = ?';
    try {
        const [result] = await conn.query(findAuthToken, [authId]);
        console.log(result);
        conn.release();
        if (result === [] || result.length === 0) {
            return 0;                   //false - No Token like this in the database!
        } else {
            return 1;                   //true - A Token like this exists!
        }
    } catch (err) {
        console.error(`An error occurred when executing: \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
};

//_+_++_+_+_+_+_+_+_+_+_+_+_+_ CHECK AUTH TOKEN - RETURN user_id _+_+_+_+_+_+_+_+_+_++_+_+_+
exports.getUserFromAuth = async function(authId) {
    const conn = await db.getPool().getConnection();
    const findUserSQL = 'SELECT user_id FROM User WHERE auth_token = ?';
    try {
        const [result] = await conn.query(findUserSQL, [authId]);
        conn.release();
        return result[0].user_id;
    } catch (err) {
        console.error(`An error occurred when executing getUserFromAuth: \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
};



//+_+_+_+_+_+ FUNCTION TO CHECK IF EMAIL EXISTS IN DATABASE +_++_+_+_++_+_+_+_+_+
exports.checkEmailStatus = async function (email){
    console.log('Checking if this email address is in use.....');
    const conn = await db.getPool().getConnection();
    const findEmailSQL = 'SELECT user_id FROM User WHERE email = ?';
    try {
        const [result] = await conn.query(findEmailSQL, [email] );
        conn.release();

        if (result === [] || result.length === 0) {
            return 0;        //false - No Email like this in the database!
        } else {
            return 1;        //true - An Email like this exists!
        }
    } catch (err) {
        console.error(`An error occurred when executing: \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
};

