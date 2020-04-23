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
    conn.release();

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

//+_+_+_+_+_+_+_+_+ SUPPORT FUNCTION FOR USER LOGIN - GETS USER WITH ID AND PASSWORD+_+_+_+_+_+_+_+_+_+_+
exports.findUser = async function(user) {
    //Function to check User exists in the dataBase. Checking by Email, return user's password if found
    console.log('Finding user and attempting to return ID and password....');
    const conn = await db.getPool().getConnection();
    const findUserSQL = 'SELECT user_id, password FROM User WHERE email = ?';

    try {
        const [result] = await conn.query(findUserSQL, [user.email]);
        conn.release();
        if (result === [] || result.length === 0) {
            return -1; // No
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

// +_+_+__+_+_+_+_+_+ LOG USER INTO SYSTEM +_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_
exports.login = async function (userId) {
    console.log('Request to login User....');
    const conn = await db.getPool().getConnection();

    const loginSQL = 'UPDATE User SET auth_token = ? WHERE user_id = ?';
    const token = randomToken.generate(32);
    try {
        await conn.query(loginSQL, [token, userId]);
        conn.release();
        return {
            'userId' : userId,
            'token' : token
        }
    } catch (err) {
        console.error(`An error occurred when executing: \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
};


exports.logout = async function (authKey) {

    const logoutSqlQuery = 'UPDATE User SET auth_token = NULL where auth_token = ?';
    const conn = await db.getPool().getConnection();
    try {
        const [result] = await conn.query(logoutSqlQuery, [authKey]);
        conn.release();

    } catch (err) {
        console.error(`An error occurred when executing: \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
};

exports.loggedInRetrieve = async function (id, authToken) {
    console.log(`Request to retrieve user ${id} from the database...`);
    const conn = await db.getPool().getConnection();
    const getUserSQL = 'SELECT user_id, name, city, country, email, auth_token FROM User WHERE user_id = ?';

    try {
        const [rows] = await conn.query(getUserSQL, [id]);
        conn.release();
        if (authToken === rows[0].auth_token) {
            let userInfo = rows[0];
            return {
                "name": userInfo.name,
                "city": userInfo.city,
                "country": userInfo.country,
                "email": userInfo.email
            }
        } else {
            let userInfo = rows[0];
            return {
                "name": userInfo.name,
                "city": userInfo.city,
                "country": userInfo.country
            }
        }
    } catch (err) {
        console.error(`An error occurred when executing: \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
};

exports.loggedOutRetrieve = async function (id) {
    console.log(`Request to retrieve user ${id} from the database...`);
    const conn = await db.getPool().getConnection();
    const getUserSQL = 'SELECT name, city, country FROM User WHERE user_id = ?';
    const [[rows]] = await conn.query(getUserSQL, [id]);
    conn.release();
    return rows;
};


exports.change = async function (id, user) {
    console.log("Now Updating User......");
    const conn = await db.getPool().getConnection();

    //Keep track of things that are to be updated.
    let updateStringList = [];
    let userData = [];
    let dataNeeded = [];

    if ('name' in user) {
        updateStringList.push('name = ' + user.name.toString());
        userData.push(user.name);
        dataNeeded.push('name = ?');
    }

    if ('email' in user) {
        updateStringList.push('email = ' + user.email.toString());
        userData.push(user.email);
        dataNeeded.push('email = ?');
    }

    //Hash the new password if it is being updated
    if ("currentPassword" in user) {
        user.password = await passwords.hash(user.password);
        updateStringList.push('password = ' + user.password.toString());
        userData.push(user.password);
        dataNeeded.push('password = ?');
    }

    if ('city' in user) {
        updateStringList.push('city = ' + user.city.toString());
        userData.push(user.city);
        dataNeeded.push('city = ?');
    }

    if ('country' in user) {
        updateStringList.push('country = ' + user.country.toString());
        userData.push(user.country);
        dataNeeded.push('country = ?');
    }

    //get the current user data before the update
    const dataBeforeUpdate = await getCurrentUserData(id);

    //const updateSQL = 'UPDATE User SET ' + updateStringList.join(', ') + ' WHERE user_id = ?';
    const updateSQL = 'UPDATE User SET ' + dataNeeded.join(', ') + ' WHERE user_id = ?';

    userData.push(id);

    try {
        await conn.query(updateSQL, userData);
        conn.release()
    } catch (err) {
        console.error(`An error occurred when executing CHANGE : \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }

    //get the current user data after the update.
    const dataAfterUpdate = await getCurrentUserData(id);

    console.log(dataBeforeUpdate);
    console.log(dataAfterUpdate);
    console.log(dataAfterUpdate === dataBeforeUpdate);

    let isDataUpdated = (dataAfterUpdate === dataBeforeUpdate);

    if (isDataUpdated === false) {
        return 1;   // updates have been made
    } else {
        return 0;   //updates have not been made to the dataBase
    }

   /* if (compareTwo(dataBeforeUpdate, dataAfterUpdate) === true) {
        return 1; // updates have been made
    } else {
        return 0;  //updates have not been made to the dataBase
    }
*/

};

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
//_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+ SUPPORT FUNCTIONS BELOW _+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_//
//============================================================================================================//



// Helper function to check if anything has been updated in dataBase
getCurrentUserData = async function(user_id) {
    console.log("Getting user details..........");
    const conn = await db.getPool().getConnection();

    const checkUpdatesSQL = 'SELECT name, email, password, city, country FROM User WHERE user_id = ?';
    try {
        const [results] = await conn.query(checkUpdatesSQL, [user_id]);
        conn.release();
        return [results[0].name, results[0].email, results[0].password, results[0].city, results[0].country];
    } catch (err) {
        console.error(`An error occurred while trying to getCurrentUserData: \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }

};


// _+_+_+_++_+_+_Check if ID exists in the database _+_+_+__+_+_+_+_+_+_+_
exports.checkIdExists = async function(user_id) {
    console.log("\nChecking if this User exists");
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



//_+_+_+_+_+++_++_+_+_+  Check Auth token exists +_+_+_+_+_++_+_+_+_+_+_+_+_+
exports.checkAuthToken = async function(authId) {
    const conn = await db.getPool().getConnection();
    const findAuthToken = 'SELECT user_id FROM User WHERE auth_token = ?';
    try {
        const [result] = await conn.query(findAuthToken, [authId]);
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

//function to get the authorId given the name of the author
exports.getAuthName = async function (id) {
    console.log('>>> Getting the authors Id from the name given......');
    const conn = await db.getPool().getConnection();
    const getAuthNameSQL = "SELECT name FROM User WHERE user_id = ?";

    try {
        const [authName] = await conn.query(getAuthNameSQL, [id]);
        conn.release();
        return authName[0].name;
    } catch (err) {
        console.error(`An error occurred when executing getAuthName : \n${err.sql} \nERROR: ${err.sqlMessage}`);
        err.hasBeenLogged = true;
    }
};