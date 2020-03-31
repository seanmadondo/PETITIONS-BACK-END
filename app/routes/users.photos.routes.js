const userPhoto = require('../controllers/users.photos.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/users/:id/photo')
        .get(userPhoto.retrieve)
        .put(userPhoto.set)
        .delete(userPhoto.delete);
};
