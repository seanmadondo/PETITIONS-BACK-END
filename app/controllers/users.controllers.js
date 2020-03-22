const user = require('../models/users.model');
const passwords = require('../passwords');


//Check email address is valid
function checkEmailValidity(email) {
    return email.includes('@');
}

exports.create = async function(req, res) {
    console.log('\nRequest to register a new user....');

    if ('name' in req.body && 'email' in req.body && 'password' in req.body) {
        if (req.body.name.length > 0 && checkEmailValidity(req.body.email) === true && req.body.password.length > 0) {
            try {
                const userId = await user.register(req.body);
                if (userId === -1) {
                    res.status(400)
                        res.statusMessage = "Email already exists!"
                        .send();
                } else {
                    res.status(201)
                        .json({userId});
                        //.send('User successfully registered!');
                }
            } catch (err) {
                res.status(500)
                    .send(`ERROR Registering User: ${err}`);
            }
        } else {
            res.status(400)
                .send('Validation check Failed: Please re-check parameters');
        }
    } else {
        res.status(400)
            .send('Validation check Failed: Name, Email and Password required!');
    }
};

exports.login = async function(req, res) {
    console.log('\nRequest to login existing user....');

    if ('email' in req.body && 'password' in req.body) {
        if (req.body.email.length > 0 && checkEmailValidity(req.body.email) === true && req.body.password.length > 0) {
            try {

                const checkUser = await user.checkEmailStatus(req.body.email);
                if (checkUser === 1) {                                        //If this email exists......
                    const userFound = await user.findUser(req.body);
                    if (userFound !== -1) {
                        const checkPasswordIsCorrect = await passwords.compare(req.body.password, userFound.password);
                        if (checkPasswordIsCorrect) {
                            const loginStatus = await user.login(userFound.userId);
                            res.statusMessage = 'User Logged in OK';
                            res.status(200)
                                .json(loginStatus);
                        } else {
                            res.status(400)
                                .send('Password comparison incorrect');
                        }
                    } else {
                        res.status(400)
                        res.statusMessage = 'No such User Found';
                    }
                } else {
                    res.status(400)
                        .send('No user exists with given email address');
                }
            } catch (err) {
                res.status(500)
                    .send(`ERROR Logging into User: ${err}`);
            }
        } else {
            res.status(400)
                .send('Email & Password Validation check failed.');
        }
    } else {
        res.status(400)
            .send('Compulsory credentials missing. Please Enter both Email and password!');
    }
};

exports.logout = async function(req, res) {
    console.log('\nRequest to logout a user............');
    const userAuthKey = req.header("X-Authorization");
    try {
        const findAuthToken = await user.checkAuthToken(userAuthKey);
        if (findAuthToken === 1) {
            await user.logout(userAuthKey);
            res.status(200)
                .send("Logout OK");
        } else {
            res.status(401)
                .send("Log out FAILED");
        }
    } catch (err) {
        if (!err.hasBeenLogged) console.error(err);
        res.status("Internal System Error")
        res.status(500)
            .send();
    }
};

exports.getOne = async function(req, res) {
    console.log("\nRequest to retrieve a user....");
    const id = req.params.id;
    const authToken = req.header("X-Authorization");

    const checkId = await user.checkIdExists(id);
    if (checkId === 1) {
        //Check to see if they have included the auth token
        if (authToken.length > 1) {
            //attempt to verify auth token
            const loginStatus = await user.checkAuthToken(authToken);
            if (loginStatus === 1) {
                try {
                    const userDetails = await user.loggedInRetrieve(id, authToken);
                    res.statusMessage = 'Retrieve Successful';
                    res.status(200)
                        .json(userDetails);
                } catch (err) {
                    res.status(500)
                        .send(`ERROR retrieving user ${id}: ${err}`);
                }
            } else {
                res.status(404)
                    .send("No authentication for provided Token");
            }
        } else {
            try {
                const userData = await user.loggedOutRetrieve(id);
                if (userData.length === 0) {
                    res.status(404)
                        .send('Invalid Id');
                } else {
                    res.status(200)
                        .send(userData);
                }
            } catch (err) {
                res.status(500)
                    .send(`ERROR retrieving user ${id}: ${err}`);
            }
        }
    } else {
        res.status(404)
            .send('No user with given Id in the DataBase');
    }
};

exports.modify = async function(req, res) {
    console.log('\nRequest to update User details...........');
    //Get required details
    const id = req.params.id;
    const authToken = req.header("X-Authorization");

    //check the Validity of the provided data
    let checkUserData = isDataValid(req.body);

    if (checkUserData === true) {
        const authorised = await user.checkAuthToken(authToken);
        if (authorised === 1) {
            try {
                const updatedStatus = await user.change(id, req.body);
                if (updatedStatus === 1) {
                    res.status(200)
                        .send("User details successfully updated")
                } else {
                    res.status(400)
                        .send("No data has been updated!");
                }

            } catch (err) {
                res.status(500)
                    .send(`ERROR modifying user ${id}: ${err}`);
            }
        } else {
            res.status(401)
                .send("Not authorised!");
        }
    } else {
        res.status(400)
            .send("Data Provided is invalid!");
    }

};

//===================================================================================================================
//+++++++++++++++++++++++++++++++++++++++ HELPER CONTROLLER FUNCTIONS ++++++++++++++++++++++++++++++++++++++++++++++

async function isDataValid(user) {
    let dataApproved = false;

    if('email' in user) {
        if (user.email.length > 0 && checkEmailValidity(user.email) === true) {
            //check email is available for use
            const emailAvailable = await user.checkEmailStatus(user.email);
            if (emailAvailable === 0) {
                dataApproved = true;
            }
        }
    }

    if ('password' in user && 'currentPassword' in user) {
        if (user.password.length > 1 && user.currentPassword.length > 1) {
            dataApproved = true;
        }
    }

    return dataApproved;
}