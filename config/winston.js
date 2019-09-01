const appRoot = require('app-root-path');
const config = require('config');
const winston = require('winston');
require('winston-daily-rotate-file');
require('winston-mail');

const { combine, timestamp, prettyPrint } = winston.format;

const options = {
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
        level: 'info',
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
    mail: {
        level: 'error',
        handleExceptions: true,
        to: 'chairfield@gmail.com',
        from: config.email.address,
        subject: 'An Error Occured On Server. Please Check IT ASAP',
        host: 'smtp.gmail.com',
        username: config.email.address,
        password: config.email.password,
        tls: true
    },
};

const logger = winston.createLogger({
    format: combine(
        timestamp(),
        prettyPrint()
    ),
    transports: [
        new winston.transports.DailyRotateFile(options.errors),
        new winston.transports.DailyRotateFile(options.combined),
        new winston.transports.Console(options.console),
        new winston.transports.Mail(options.mail)
    ],
    exitOnError: false, // do not exit on handled exceptions
});

logger.stream = {
    write: function(message, encoding) {
        logger.info(message);
    },
};

module.exports = logger;
