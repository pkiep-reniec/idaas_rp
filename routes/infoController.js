var httpBuildQuery = require('http-build-query');
var config = require('../config/config.json');

var controller = {
    getIndex: function (req, res, next) {
        resAuth = Buffer.from(JSON.stringify(req.session.resAuth)).toString('base64');
        resToken = Buffer.from(JSON.stringify(req.session.resToken)).toString('base64');
        resUser = Buffer.from(JSON.stringify(req.session.resUser)).toString('base64');

        uriToken = req.session.idaas.token_endpoint;
        uriUser = req.session.idaas.userinfo_endpoint;

        res.render('info', {
            resAuth: resAuth,
            resToken: resToken,
            resUser: resUser,
            uriToken: uriToken,
            uriUser: uriUser,
            baseUrl: config.app.baseUrl
        });
    },
    getIndexImplicit: function (req, res, next) {
        res.render('info_implicit', {
            baseUrl: config.app.baseUrl
        });
    },
    getLogout: function (req, res, next) {
        let params = {
            post_logout_redirect_uri: config.app.baseUrl
        };

        let logoutUri = req.session.idaas.end_session_endpoint;
        logoutUri += '?' + httpBuildQuery(params);

        req.session.destroy();

        res.redirect(logoutUri);
    }
};

module.exports = controller;
