let request = require('request-promise');
let httpBuildQuery = require('http-build-query');
let randomstring = require("randomstring");
let config = require('../config/config.json');
let logger = require('../server/logger').logger;

let controller = {
    getIndex: (req, res, next) => {
        let cookie = req.cookies.idaas;
        let data = '';
        let ops = [];

        if (cookie != undefined) {
            ops = JSON.parse(cookie);
            data = Buffer.from(cookie).toString('base64');
        }

        res.render('home', {
            ops: ops,
            data: data,
            idaasUrl: config.idaas.url,
            baseUrl: config.app.baseUrl,
            defaultUrl: config.idaas.url,
            defaultClientId: config.idaas.client_id,
            defaultClientSecret: config.idaas.client_secret
        });
    },
    postAuth: async (req, res, next) => {
        if (req.query.save == 'on') {
            let cookie = req.cookies.idaas;

            if (cookie === undefined) {
                res.cookie('idaas', JSON.stringify([{
                    id: 1,
                    url: req.query.url,
                    client_id: req.query.client_id,
                    client_secret: req.query.client_secret,
                    redirect_uri: req.query.redirect_uri
                }]), {maxAge: 60 * 60 * 24 * 365 * 5, httpOnly: true});
            } else {
                let jCookie = JSON.parse(cookie);
                let save = true;

                for (i = 0; i < jCookie.length; i++) {
                    if (jCookie[i].url == req.query.url) {
                        save = false;
                        break;
                    }
                }

                if (save && req.query.op == 0) {
                    jCookie.push({
                        id: jCookie[jCookie.length - 1].id + 1,
                        url: req.query.url,
                        client_id: req.query.client_id,
                        client_secret: req.query.client_secret,
                        redirect_uri: req.query.redirect_uri
                    });

                    res.cookie('idaas', JSON.stringify(jCookie), {maxAge: 60 * 60 * 24 * 365 * 5, httpOnly: true});
                }
            }
        }

        let webFinger = await procWebfinger(req.query);

        if (webFinger == null) {
            res.sendStatus(400);
        }

        let discover = await procDiscover(webFinger);

        if (discover == null) {
            res.sendStatus(400);
        }

        req.session.idaas = discover;
        req.session.reqParam = req.query;
        req.session.state = randomstring.generate();

        let url = buildAuthRequest(req.query, discover, req.session.state);

        res.json({url: url});
    }
};

let buildAuthRequest = (reqParams, idaas, state) => {
    let params = {
        response_type: '',
        client_id: reqParams.client_id,
        redirect_uri: reqParams.redirect_uri,
        state: state,
        scope: '',
        prompt: '',
        acr_values: reqParams.acr_value
    };
    let scopes = ['openid'];
    let responseTypes = [];
    let prompts = [];

    //Max Age
    if (!isNaN(reqParams.max_age)) {
        params.max_age = reqParams.max_age;
    }

    //Login hint
    if (reqParams.login_hint) {
        params.login_hint = reqParams.login_hint;
    }

    //Scopes
    if (reqParams.scope_profile == 'on') {
        scopes.push('profile');
    }

    if (reqParams.scope_email == 'on') {
        scopes.push('email');
    }

    if (reqParams.scope_phone == 'on') {
        scopes.push('phone');
    }

    if (reqParams.scope_offline_access == 'on') {
        scopes.push('offline_access');
    }

    //Response type
    if (reqParams.response_code == 'on') {
        responseTypes.push('code');
    }

    if (reqParams.response_id_token == 'on') {
        responseTypes.push('id_token');
    }

    if (reqParams.response_token == 'on') {
        responseTypes.push('token');
    }

    //Prompts
    if (reqParams.prompt_none == 'on') {
        prompts.push('none');
    }

    if (reqParams.prompt_login == 'on') {
        prompts.push('login');
    }

    if (reqParams.prompt_consent == 'on') {
        prompts.push('consent');
    }

    params.scope = scopes.join(' ');
    params.response_type = responseTypes.join(' ');
    params.prompt = prompts.join(' ');
    let url = idaas.authorization_endpoint + '?' + httpBuildQuery(params);

    return url;
};

let procDiscover = async (webfinger) => {
    logger.info('start procDiscover');

    let url = webfinger.links.href + '/.well-known/openid-configuration';
    let result = null;

    try {
        result = await request({
            url: url,
            method: 'GET',
            json: true
        });
    } catch (err) {
        logger.info(err);
    }

    logger.info('end procDiscover');

    return result;
};

let procWebfinger = async (reqParams) => {
    logger.info('start procWebfinger');
    let params = {
        resource: reqParams.url,
        rel: 'http://openid.net/specs/connect/1.0/issuer'
    };
    let url = reqParams.url + '/.well-known/webfinger';
    let result = null;

    try {
        result = await request({
            url: url,
            method: 'GET',
            json: true,
            qs: params
        });
    } catch (err) {
        logger.info(err);
    }

    logger.info('end procWebfinger');

    return result;
};

module.exports = controller;