/**
 * Created by Miguel Pazo (https://miguelpazo.com)
 */

const express = require('express');
const router = express.Router();
const homeController = require('./homeController');
const endpointController = require('./endpointController');
const infoController = require('./infoController');

module.exports = function () {

    router.get('', homeController.getIndex);
    router.get('/auth', homeController.postAuth);
    router.get('/auth-endpoint', endpointController.getIndex);
    router.get('/info', infoController.getIndex);
    router.get('/info-implicit', infoController.getIndexImplicit);
    router.get('/logout', infoController.getLogout);

    return router;

};
