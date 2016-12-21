var express = require('express');
var apicache = require('apicache').options({ debug: false }).middleware;
var morgan = require('morgan');
var MongoClient = require('mongodb').MongoClient;
var config = require('./config.js');


var app = express();
app.use(morgan('common'));

app.use(require('apikey')(auth, 'my realm'));

function auth (key, fn) {
  if ('test' === key)
    fn(null, { id: '1', name: 'password'})
  else
    fn(null, null)
}

MongoClient.connect(config.mongoURL, function(err, db) {
    console.log("Connected correctly to server");

    app.get('/api/:id', apicache("1 day"), function (request, response) {
      launchMongoQuery(request, response, request.params.id, "application/json");
    });

    app.get('*', function(req, res){
      res.send(400);
    });


    var launchMongoQuery = function(req, res, id, type) {
        db.collection('file', function(err, collection) {
            if (!err) {
                collection.find({}).toArray(function(err, docs) {
                    res.send(docs);
                });
            } else {
                console.log(err)
            }
        });
    }


    var server = app.listen(80, function() {
        var host = server.address().address;
        var port = server.address().port;
        console.log('Server listening at http://%s:%s', host, port);
    });
});
