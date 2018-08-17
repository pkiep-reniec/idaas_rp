var request = require('request');
var httpBuildQuery = require('http-build-query');
var randomstring = require("randomstring");
var config = require('../config/config.json');

var controller = {
    getIndex: function (req, res, next) {
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
    postAuth: function (req, res, next) {
        if (req.body.save == 'on') {
            let cookie = req.cookies.idaas;

            if (cookie === undefined) {
                res.cookie('idaas', JSON.stringify([{
                    id: 1,
                    url: req.body.url,
                    client_id: req.body.client_id,
                    client_secret: req.body.client_secret,
                    redirect_uri: req.body.redirect_uri
                }]), {maxAge: 60 * 60 * 24 * 365 * 5, httpOnly: true});
            } else {
                let jCookie = JSON.parse(cookie);
                let save = true;

                for (i = 0; i < jCookie.length; i++) {
                    if (jCookie[i].url == req.body.url) {
                        save = false;
                        break;
                    }
                }

                if (save && req.body.op == 0) {
                    jCookie.push({
                        id: jCookie[jCookie.length - 1].id + 1,
                        url: req.body.url,
                        client_id: req.body.client_id,
                        client_secret: req.body.client_secret,
                        redirect_uri: req.body.redirect_uri
                    });

                    res.cookie('idaas', JSON.stringify(jCookie), {maxAge: 60 * 60 * 24 * 365 * 5, httpOnly: true});
                }
            }
        }

        procWebfinger(req.body)
            .then(function (response) {
                procDiscover(response)
                    .then(function (response) {
                        req.session.idaas = response;
                        req.session.reqParam = req.body;
                        req.session.state = randomstring.generate();

                        let url = buildAuthRequest(req.body, response, req.session.state);

                        res.json({url: url});
                    }, function (error) {
                        console.log(error);
                        res.sendStatus(error.code);
                    });
            }, function (error) {
                console.log(error);
                res.sendStatus(error.code);
            });
    }
};

var buildAuthRequest = function (reqParams, idaas, state) {
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

var procDiscover = function (webfinger) {
    let url = webfinger.links.href + '/.well-known/openid-configuration';

    return new Promise(function (resolve, reject) {
        request({
            url: url,
            rejectUnauthorized: false
        }, function (error, response, body) {
            try {
                let data = JSON.parse(body);

                if (!error && response.statusCode == 200) {
                    resolve(data);
                } else {
                    if (response != undefined && !isNaN(response.statusCode)) {
                        reject({data: data, code: response.statusCode});
                    } else {
                        reject({data: null, code: 500});
                    }
                }
            } catch (err) {
                reject({data: null, code: 500});
            }
        });
    });
};

var procWebfinger = function (reqParams) {
    let params = {
        resource: reqParams.url,
        rel: 'http://openid.net/specs/connect/1.0/issuer'
    };
    let url = reqParams.url + '/.well-known/webfinger';

    return new Promise(function (resolve, reject) {
        request({
            url: url,
            rejectUnauthorized: false,
            method: 'GET',
            qs: params
        }, function (error, response, body) {
            try {
                let data = JSON.parse(body);

                if (!error && response.statusCode == 200) {
                    resolve(data);
                } else {
                    if (response != undefined && !isNaN(response.statusCode)) {
                        reject({data: data, code: response.statusCode});
                    } else {
                        reject({data: null, code: 500});
                    }
                }
            } catch (err) {
                reject({data: null, code: 500});
            }
        });
    });
};

module.exports = controller;