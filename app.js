var express = require('express');
var logger = require('morgan');

var indexRouter = require('./src/index');

var app = express();

app.use(logger('dev'));
app.use(express.json());

app.use('/', indexRouter);

module.exports = app;

