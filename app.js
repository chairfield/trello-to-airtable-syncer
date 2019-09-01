var express = require('express');
var morgan = require('morgan');

var indexRouter = require('./src/index');
var winston = require('./config/winston');

var app = express();

app.use(morgan('combined', { stream: winston.stream }));
app.use(express.json());

app.use('/', indexRouter);

module.exports = app;

