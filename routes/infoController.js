let httpBuildQuery = require('http-build-query');
let config = require('../config/config.json');

let controller = {
    getIndex: (req, res, next) => {
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
    getIndexImplicit: (req, res, next) => {
        res.render('info_implicit', {
            baseUrl: config.app.baseUrl
        });
    },
    getLogout: (req, res, next) => {
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
