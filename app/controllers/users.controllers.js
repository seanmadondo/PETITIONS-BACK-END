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
                const userFound = await user.findUser(req.body);
                if ('userId' in userFound && 'password' in userFound) {
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
            } catch (err) {
                res.status(500)
                    .send(`ERROR Login into User: ${err}`);
            }
        } else {
            res.status(400)
                .send('Email Password Validation check failed.');
        }
    } else {
        res.status(400)
            .send('Compulsory credential missing. Please Enter both Email and password!');
    }
};

exports.logout = async function(req, res) {


};

exports.getOne = async function(req, res) {
    console.log("\nRequest to retrieve a user....");
    const id = req.params.id;
    try {
        const result = await user.retrieve(id);
        if (result.length === 0) {
            res.status(400)
                .send('Invalid Id');
        } else {
            res.status(200)
                .send(result);
        }
    } catch (err) {
        res.status(404)
            .send(`ERROR retrieving user ${id}: ${err}`);
    }
};

exports.change = async function(req, res) {


};

