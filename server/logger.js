const winston = require('winston');
const expressWinston = require('winston-express-middleware');

let logConfig = {
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

let middleware = new (expressWinston.logger)(logConfig);
let logger = new (winston.Logger)(logConfig);

module.exports = {middleware: middleware, logger: logger};