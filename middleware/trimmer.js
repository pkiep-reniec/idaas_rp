var _ = require('underscore');

module.exports = function (req, res, next) {
    exclude = [
        'password',
    ];

    var convertInt = function (value) {
        if (!isNaN(value)) {
            return parseInt(value);
        }

        return value;
    };

    switch (req.method) {
        case 'POST':
            req.body = _.object(_.map(req.body, function (value, key) {
                if (exclude.indexOf(key) == -1) {
                    return [key, convertInt(value.trim())];
                } else {
                    return [key, value];
                }
            }));
            break;

        case 'GET':
            req.query = _.object(_.map(req.query, function (value, key) {
                if (exclude.indexOf(key) == -1) {
                    return [key, convertInt(value.trim())];
                } else {
                    return [key, value];
                }
            }));
            break;
    }

    next();
};