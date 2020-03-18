const user = require('../models/users.model');



//Check email address is valid
function checkEmailValidity(email) {
    return email.includes('@');
}

exports.create = async function(req, res) {
    console.log('\nRequest to register a new user....');

    if ('name' in req.body && 'email' in req.body && 'password' in req.body) {
        if (req.body.name.length > 0 && checkEmailValidity(req.body.email) === true && req.body.password.length > 0) {
            try {
                const insertId = await user.register(req.body);
                if (insertId === -1) {
                    res.status(500)
                        res.statusMessage = "Email already exists!"
                        .send();
                } else {
                    res.status(201)
                        .json({insertId});
                        //.send('User successfully registered!');
                }
            } catch (err) {
                res.status(500)
                    .send(`ERROR Registering User: ${err}`);
            }
        } else {
            res.status(500)
                .send('Validation check Failed: Please re-check parameters');
        }
    } else {
        res.status(500)
            .send('Validation check Failed: Name, Email and Password required!');
    }
};

exports.login = async function(req, res) {


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
        res.status(500)
            .send(`ERROR retrieving user ${id}: ${err}`);
    }
};

exports.change = async function(req, res) {


};

