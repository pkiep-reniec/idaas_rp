var winston = require('winston');
var expressWinston = require('winston-express-middleware');

var logConfig = {
    transports: [
        new (winston.transports.Console)({json: false, timestamp: true}),
        // new winston.transports.File({filename: __dirname + '/../logs/debug.log', json: false})
    ],
    exceptionHandlers: [
        new (winston.transports.Console)({json: false, timestamp: true}),
        // new winston.transports.File({filename: __dirname + '/../logs/exceptions.log', json: false})
    ],
    exitOnError: false
};

var middleware = new (expressWinston.logger)(logConfig);
var logger = new (winston.Logger)(logConfig);

module.exports = {middleware: middleware, logger: logger};