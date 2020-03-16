const petitions = require('../controllers/petitions.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/petitions')
        .get(petitions.view)
        .post(petitions.add);

    app.route(app.rootUrl + '/petitions/{id}')
        .get(petitions.retrieve)
        .patch(petitions.change)
        .delete(petitions.delete);

    app.route(app.rootUrl + '/petitions/categories')
        .get(petitions.retrieveCat);
};
