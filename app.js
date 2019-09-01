const express = require('express');
const morgan = require('morgan');

const indexRouter = require('./src/index');
const winston = require('./config/winston');

const app = express();

app.use(morgan('combined', { stream: winston.stream }));
app.use(express.json());

app.use('/', indexRouter);

module.exports = app;

