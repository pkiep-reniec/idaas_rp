var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
// var logger = require('morgan');
var logMiddleware = require('./logger.js').middleware;
var cookieParser = require('cookie-parser');
var cookieEncrypter = require('cookie-encrypter');
var bodyParser = require('body-parser');
var session = require('express-session')

var config = require('../config/config.json');
var app = express();
var server = require('http').Server(app);
var router = require('../routes/_index')();
var middleware = require('../middleware/_index');

app.set('trust proxy', '127.0.0.1');

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, '../public/img/icon.ico')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//middlewares
for (var i = 0; i < middleware.length; i++) {
    app.use(middleware[i]);
}

app.use(cookieParser(config.app.key));
app.use(cookieEncrypter(config.app.key));
app.use(session({
    secret: config.app.key,
    httpOnly: true
}));
app.use(express.static(path.join(__dirname, '../public')));
app.use(router);
app.use(logMiddleware);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    res.locals.baseUrl = config.app.baseUrl;

    if (err.name == 'IpDeniedError') {
        res.status(403);
        err.stack = null;
        res.locals.error = err;
    } else {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = config.app.env === 'dev' ? err : {};

        // render the error page
        res.status(err.status || 500);
    }

    res.render('error');
});

//module.exports = app;
module.exports = {app: app, server: server};