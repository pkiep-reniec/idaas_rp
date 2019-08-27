/**
 * Created by Miguel Pazo (https://miguelpazo.com)
 */

const randomstring = require("randomstring");
const config = require('../config/config.json');
const configAuth = require('./../config/reniec_idaas.json');
const reniecIdaas = require('reniec-idaas');
const _ = require('underscore');

let controller = {
    getIndex: (req, res, next) => {
        return res.render('home', {
            baseUrl: config.app.baseUrl,
            clientId: configAuth.client_id
        });
    },

    postAuth: async (req, res, next) => {
        let state = randomstring.generate();
        let params = filterParams(req.query);
        let paramsFinal = _.extend(params, {
            redirectUri: config.app.baseUrl + '/auth-endpoint',
            state: state,
            config: configAuth
        });

        req.session.params = paramsFinal;

        reniecIdaas.setConfig(paramsFinal);

        return res.json({url: reniecIdaas.getLoginUrl()});
    }
};

function filterParams(reqParams) {
    let params = {
        scopes: [],
        acr: reqParams.acr_value,
        prompts: [],
        responseTypes: [],
        maxAge: null,
        loginHint: null
    };

    //Max Age
    if (!isNaN(reqParams.max_age)) {
        params.maxAge = reqParams.max_age;
    }

    //Login hint
    if (reqParams.login_hint) {
        params.loginHint = reqParams.login_hint;
    }

    //Scopes
    if (reqParams.scope_profile == 'on') {
        params.scopes.push(reniecIdaas.constAuth.SCOPE_PROFILE);
    }

    if (reqParams.scope_email == 'on') {
        params.scopes.push(reniecIdaas.constAuth.SCOPE_EMAIL);
    }

    if (reqParams.scope_phone == 'on') {
        params.scopes.push(reniecIdaas.constAuth.SCOPE_PHONE);
    }

    if (reqParams.scope_offline_access == 'on') {
        params.scopes.push(reniecIdaas.constAuth.SCOPE_OFFLINE_ACCESS);
    }

    //Response type
    if (reqParams.response_code == 'on') {
        params.responseTypes.push('code');
    }

    if (reqParams.response_id_token == 'on') {
        params.responseTypes.push('id_token');
    }

    if (reqParams.response_token == 'on') {
        params.responseTypes.push('token');
    }

    //Prompts
    if (reqParams.prompt_none == 'on') {
        params.prompts.push(reniecIdaas.constAuth.PROMPT_NONE);
    }

    if (reqParams.prompt_login == 'on') {
        params.prompts.push(reniecIdaas.constAuth.PROMPT_LOGIN);
    }

    if (reqParams.prompt_consent == 'on') {
        params.prompts.push(reniecIdaas.constAuth.PROMPT_CONSENT);
    }

    return params;
}

module.exports = controller;