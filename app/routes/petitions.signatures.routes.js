const petitionSignature = require('../controllers/petitions.signatures.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/petitions/{id}/signatures')
        .get(petitionSignature.retrieve)
        .post(petitionSignature.sign)
        .delete(petitionSignature.remove);
};
