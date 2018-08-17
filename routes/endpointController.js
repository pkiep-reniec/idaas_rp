var request = require('request');
var config = require('../config/config.json');

var controller = {
    getIndex: function (req, res, next) {
        if (!req.query.error) {
            if (req.session.state == req.query.state) {
                req.session.resAuth = req.query;

                tokenEndpoint(req)
                    .then(function (response) {
                        req.session.resToken = response;

                        userinfoEndpoint(req, response)
                            .then(function (response) {
                                req.session.resUser = response;
                                res.redirect(config.app.baseUrl + 'info');
                            }, function (error) {
                                res.render('error', {
                                    baseUrl: config.app.baseUrl,
                                    error: {
                                        message: error.data != null ? error.data.error : '',
                                        status: error.code,
                                        stack: error.data != null ? error.data.error_description : '',
                                    }
                                });
                            });
                    }, function (error) {
                        res.render('error', {
                            baseUrl: config.app.baseUrl,
                            error: {
                                message: error.data != null ? error.data.error : '',
                                status: error.code,
                                stack: error.data != null ? error.data.error_description : '',
                            }
                        });
                    });
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

var userinfoEndpoint = function (req, data) {
    url = req.session.idaas.userinfo_endpoint;

    return new Promise(function (resolve, reject) {
        request({
            url: url,
            rejectUnauthorized: false,
            method: 'GET',
            json: true,
            headers: {
                Authorization: 'Bearer ' + data.access_token
            }
        }, function (error, response, body) {
            try {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    if (response != undefined && !isNaN(response.statusCode)) {
                        reject({data: body, code: response.statusCode});
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

var tokenEndpoint = function (req) {
    url = req.session.idaas.token_endpoint;
    params = {
        grant_type: 'authorization_code',
        code: req.query.code,
        redirect_uri: req.session.reqParam.redirect_uri,
        client_id: req.session.reqParam.client_id,
        client_secret: req.session.reqParam.client_secret,
    };

    return new Promise(function (resolve, reject) {
        request({
            url: url,
            rejectUnauthorized: false,
            method: 'POST',
            json: true,
            form: params,
        }, function (error, response, body) {
            try {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    if (response != undefined && !isNaN(response.statusCode)) {
                        reject({data: body, code: response.statusCode});
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
