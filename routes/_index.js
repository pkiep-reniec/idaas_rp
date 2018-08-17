var express = require('express');
var router = express.Router();
var homeController = require('./homeController');
var endpointController = require('./endpointController');
var infoController = require('./infoController');

module.exports = function () {

    router.get('', (req, res, next) => {
        homeController.getIndex(req, res, next);
    });
    router.post('/auth', (req, res, next) => {
        homeController.postAuth(req, res, next);
    });
    router.get('/auth-endpoint', (req, res, next) => {
        endpointController.getIndex(req, res, next);
    });
    router.get('/info', (req, res, next) => {
        infoController.getIndex(req, res, next);
    });
    router.get('/info-implicit', (req, res, next) => {
        infoController.getIndexImplicit(req, res, next);
    });
    router.get('/logout', (req, res, next) => {
        infoController.getLogout(req, res, next);
    });

    return router;

};
