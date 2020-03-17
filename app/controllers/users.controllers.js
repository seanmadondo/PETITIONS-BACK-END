const user = require('../models/users.model');


//Check email address is valid
function checkEmailValidity(email) {
    return email.includes('@')
}

exports.register = async function(req, res) {
    console.log('\nRequest to register a new user....');

    if (!checkEmailValidity(req.body.email)) {
        console.log("Bad email address entered...");
        res.status(500)
            .send(`${email} IS NOT A VALID EMAIL ADDRESS`);
    } else {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const city = req.body.city;
        const country = req.body.country;

        try {
            const result = await user.register(name, email, password, city, country);
            res.status(200)
                .send('User Successfully Registered!');
        } catch (err) {
            res.status(500)
                .send(`ERROR Registering User ${name}: ${err}`);
        }
    }
};

exports.login = async function(req, res) {


};

exports.logout = async function(req, res) {


};

exports.retrieve = async function(req, res) {
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

