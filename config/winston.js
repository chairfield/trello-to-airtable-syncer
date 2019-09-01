var appRoot = require('app-root-path');
var winston = require('winston');
require('winston-daily-rotate-file');

const { combine, timestamp, prettyPrint } = winston.format;

var options = {
    errors: {
        level: 'error',
        filename: `${appRoot}/logs/%DATE%-error.log`,
        datePattern: 'YYYY-MM-DD',
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        colorize: false,
    },
    combined: {
        level: 'debug',
        filename: `${appRoot}/logs/%DATE%-combined.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        colorize: false,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

var logger = winston.createLogger({
    format: combine(
        timestamp(),
        prettyPrint()
    ),
    transports: [
        new winston.transports.DailyRotateFile(options.errors),
        new winston.transports.DailyRotateFile(options.combined),
        new winston.transports.Console(options.console)
    ],
    exitOnError: false, // do not exit on handled exceptions
});

logger.stream = {
    write: function(message, encoding) {
        logger.info(message);
    },
};

module.exports = logger;
