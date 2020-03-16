const user = require('../controllers/users.controllers');

module.exports = function (app) {
    app.route(app.rootUrl + '/users/register')
        .post(user.register);

    app.route(app.rootUrl + '/users/login')
        .post(user.login);

    app.route(app.rootUrl + '/users/logout')
        .post(user.logout);

    app.route(app.rootUrl + '/users/{id}')
        .get(user.retrieve)
        .patch(user.change);
};