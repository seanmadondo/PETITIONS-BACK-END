const user = require('../controllers/users.controllers');

module.exports = function (app) {
    app.route(app.rootUrl + '/users/register')
        .post(user.create);

    app.route(app.rootUrl + '/users/login')
        .post(user.login);

    app.route(app.rootUrl + '/users/logout')
        .post(user.logout);

    app.route(app.rootUrl + '/users/:id')
        .get(user.getOne);
        //.patch(user.change);
};