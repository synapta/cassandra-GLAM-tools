var express = require('express');
var apicache = require('apicache').options({ debug: false }).middleware;
var morgan = require('morgan');
var config = require('./config.js');

var app = express();
app.use(morgan('common'));

require('./routes.js')(app, apicache);

var server = app.listen(80, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server listening at http://%s:%s', host, port);
});
