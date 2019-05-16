/**
 * Created by Miguel Pazo (https://miguelpazo.com)
 */

const config = require('../config/config.json');
const configAuth = require('./../config/reniec_idaas.json');
const reniecIdaas = require('reniec-idaas');

let controller = {
    getIndex: (req, res, next) => {
        resAuth = Buffer.from(JSON.stringify(req.session.resAuth)).toString('base64');
        resToken = Buffer.from(JSON.stringify(req.session.resToken)).toString('base64');
        resUser = Buffer.from(JSON.stringify(req.session.resUser)).toString('base64');

        uriToken = configAuth.token_uri;
        uriUser = configAuth.userinfo_uri;

        return res.render('info', {
            resAuth: resAuth,
            resToken: resToken,
            resUser: resUser,
            uriToken: uriToken,
            uriUser: uriUser,
            baseUrl: config.app.baseUrl,
            clientId: configAuth.client_id
        });
    },

    getIndexImplicit: (req, res, next) => {
        return res.render('info_implicit', {
            baseUrl: config.app.baseUrl,
            clientId: configAuth.client_id
        });
    },

    getLogout: (req, res, next) => {
        reniecIdaas.setConfig({config: configAuth});

        let logoutUri = reniecIdaas.getLogoutUri(config.app.baseUrl + '/');
        return res.redirect(logoutUri);
    }
};

module.exports = controller;
