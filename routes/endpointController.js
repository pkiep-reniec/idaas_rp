let request = require('request-promise');
let config = require('../config/config.json');
let logger = require('../server/logger').logger;

let controller = {
    getIndex: async (req, res, next) => {
        if (!req.query.error) {
            if (req.session.state == req.query.state) {
                let tokens = await tokenEndpoint(req);

                if (tokens == null) {
                    res.sendStatus(400);
                }

                let userInfo = await userinfoEndpoint(req, tokens);

                if (userInfo == null) {
                    res.sendStatus(400);
                }

                req.session.resAuth = req.query;
                req.session.resToken = tokens;
                req.session.resUser = userInfo;
                res.redirect(config.app.baseUrl + '/info');
            } else {
                res.render('error', {
                    baseUrl: config.app.baseUrl,
                    error: {
                        message: 'Wrong state',
                        status: '',
                        stack: 'Wrong state',
                    }
                });
            }
        } else {
            res.render('error', {
                baseUrl: config.app.baseUrl,
                error: {
                    message: req.query.error,
                    status: '',
                    stack: req.query.error_description
                }
            });
        }
    }
};

let userinfoEndpoint = async (req, data) => {
    logger.info('start userinfoEndpoint');

    let url = req.session.idaas.userinfo_endpoint;
    let result = null;

    try {
        result = await request({
            url: url,
            method: 'GET',
            json: true,
            headers: {
                Authorization: 'Bearer ' + data.access_token
            }
        });
    } catch (err) {
        logger.info(err);
    }

    logger.info('end userinfoEndpoint');

    return result;
};

let tokenEndpoint = async (req) => {
    logger.info('start tokenEndpoint');

    let url = req.session.idaas.token_endpoint;
    let params = {
        grant_type: 'authorization_code',
        code: req.query.code,
        redirect_uri: req.session.reqParam.redirect_uri,
        client_id: req.session.reqParam.client_id,
        client_secret: req.session.reqParam.client_secret,
    };
    let result = null;

    try {
        result = await request({
            url: url,
            method: 'POST',
            json: true,
            form: params
        });
    } catch (err) {
        logger.info(err);
    }

    logger.info('end tokenEndpoint');

    return result;
};

module.exports = controller;
