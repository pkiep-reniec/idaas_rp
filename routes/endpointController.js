/**
 * Created by Miguel Pazo (https://miguelpazo.com)
 */

const config = require('../config/config.json');
const reniecIdaas = require('reniec-idaas');

let controller = {
    getIndex: async (req, res, next) => {
        if (req.query.error) {
            return res.render('error', {
                baseUrl: config.app.baseUrl,
                error: {
                    message: req.query.error,
                    status: '',
                    stack: req.query.error_description
                }
            });
        }

        if (req.session.params.state != req.query.state) {
            return res.render('error', {
                baseUrl: config.app.baseUrl,
                error: {
                    message: 'Wrong state',
                    status: '',
                    stack: 'Wrong state',
                }
            });
        }

        reniecIdaas.setConfig(req.session.params);

        let tokens = await reniecIdaas.getTokens(req.query.code);

        if (tokens == null) {
            res.sendStatus(400);
        }

        let userInfo = await reniecIdaas.getUserInfo(tokens.access_token);

        if (userInfo == null) {
            res.sendStatus(400);
        }

        req.session.resAuth = req.query;
        req.session.resToken = tokens;
        req.session.resUser = userInfo;

        return res.redirect(config.app.baseUrl + 'info');
    }
};

module.exports = controller;
