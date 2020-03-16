const petitionPhoto = require('../controllers/petitions.photos.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/petitions/{id}/photo')
        .get(petitionPhoto.retrieve)
        .put(petitionPhoto.set);
};
