var express = require('express');
var apicache = require('apicache').options({ debug: false }).middleware;
var morgan = require('morgan');
var Sentry = require('@sentry/node');
var config = require('../config/config.json');

var app = express();

if (typeof config.raven !== 'undefined') {
    Sentry.init({dsn: config.raven.glamtoolsweb.DSN});
    app.use(Sentry.Handlers.requestHandler());
}

app.use(morgan('common'));
app.use(express.json());

require('./routes.js')(app, apicache);

if (typeof config.raven !== 'undefined') {
    app.use(Sentry.Handlers.errorHandler());
}

var port = process.argv[2] ? parseInt(process.argv[2]) : 8081;

var server = app.listen(port, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server listening at http://%s:%s', host, port);
});
