//INCLUDES
var express = require('express');
var apicache = require('apicache').options({ debug: false }).middleware;
var morgan = require('morgan');
var config = require('./config.js');
var api = require('./api.js');
//GLOBALS
var DBConnections=[];

//FUNCTIONS
function auth (key, fn) {
    if (config.SERVICE_USER === key)
      fn(null, { id: '1', name: config.SERVICE_PASSWORD})
    else
      fn(null, null)
}
function getIndexOfDb(id,arr)
{
    i=0;
    while(i<arr.length)
    {
        if(arr[i].name==id)
            break
        i++;
    }
    if(i==arr.length)
        i=-1;
    return i;
}
function getDatabase(id){
    index=getIndexOfDb(id,DBConnections);
    if(index!=-1)
        return DBConnections[index].connection;
    else
    {
        index=getIndexOfDb(id,config.DBs);
        if(index==-1)
            return null;
        else
        {
            conn=Object();
            conn.name=config.DBs[index].name;
            conn.connection=config.DBs[index].connection;
            conn.connection.connect();
            DBConnections[DBConnections.length]=conn;
            return conn.connection;
        }
    }    
}
//ENTRY POINT
var app = express();
app.use(morgan('common'));
app.use(require('apikey')(auth, 'GLAM tool'));

app.get('/api/:id/category/', apicache("1 hour"), function (request, response) {
    var db=getDatabase(request.params.id);
    if (db!=null) {
        api.categoryGraph(request, response, request.params.id, db);
    } else {
        response.sendStatus(400);
    }
});

app.get('/api/:id/file/upload-date', apicache("1 hour"), function (request, response) {
    var db=getDatabase(request.params.id);
    if (db!=null) {
        api.uploadDate(request, response, request.params.id, request.query.start, request.query.end, db);
    } else {
        response.sendStatus(400);
    }
});

app.get('/docs', function(req, res){
    res.sendFile(__dirname + '/docs.html');
});

app.get('*', function(req, res){
    res.sendStatus(400);
});

var server = app.listen(80, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server listening at http://%s:%s', host, port);
});
