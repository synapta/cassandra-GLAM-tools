//INCLUDES
var express = require('express');
var apicache = require('apicache').options({ debug: false }).middleware;
var morgan = require('morgan');
var config = require('./config.js');

function auth (key, fn) {
    if (config.SERVICE_USER === key)
      fn(null, { id: '1', name: config.SERVICE_PASSWORD})
    else
      fn(null, null)
}

var app = express();
app.use(morgan('common'));
app.use(require('apikey')(auth, 'GLAM tool'));

require('./routes.js')(app, apicache);

var server = app.listen(80, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server listening at http://%s:%s', host, port);
});
