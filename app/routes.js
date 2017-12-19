var express = require('express');
var api = require('./api.js');
var config = require('./config.js');

//GLOBALS
var DBConnections=[];

function getIndexOfDb(id,arr) {
    var i = 0;
    while (i < arr.length) {
        if(arr[i].name === id)
            break;
        i++;
    }
    if (i === arr.length)
        i = -1;
    return i;
}

function getDatabase(id){
    index = getIndexOfDb(id, DBConnections);
    if(index !== -1)
        return DBConnections[index].connection;
    else {
        index = getIndexOfDb(id, config.DBs);
        if(index === -1)
            return null;
        else {
            conn = Object();
            conn.name = config.DBs[index].name;
            conn.connection = config.DBs[index].connection;
            conn.connection.connect();
            DBConnections[DBConnections.length] = conn;
            return conn.connection;
        }
    }
}

module.exports = function(app, apicache) {
	app.use('/:id/',express.static(__dirname + '/views'));

	app.get('/api/:id/category/', apicache("1 hour"), function (request, response) {
	    var db=getDatabase(request.params.id);
	    if (db!=null) {
		api.categoryGraph(request, response, request.params.id, db);
	    } else {
		response.sendStatus(400);
	    }
	});
	app.get('/api/:id/rootcategory/', apicache("1 hour"), function (request, response) {
	    var db=getDatabase(request.params.id);
	    if (db!=null) {
		api.rootCategory(request, response, request.params.id, db);
	    } else {
		response.sendStatus(400);
	    }
	});
	app.get('/api/:id/views/by-date', apicache("1 hour"), function (request, response) {
	    var db=getDatabase(request.params.id);
	    if (db!=null) {
		api.viewsByDate(request, response, request.params.id, db);
	    } else {
		response.sendStatus(400);
	    }
	});
	app.get('/api/:id/views/all', apicache("1 hour"), function (request, response) {
	    var db=getDatabase(request.params.id);
	    if (db!=null) {
		api.viewsAll(request, response, request.params.id, db);
	    } else {
		response.sendStatus(400);
	    }
	});
	app.get('/api/:id/usage/', apicache("1 hour"), function (request, response) {
	    var db=getDatabase(request.params.id);
	    if (db!=null) {
		api.usage(request, response, request.params.id, db);
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
	    var path = require('path');
	    res.sendFile(path.resolve('../docs/docs.html'));
	});

	app.get('*', function(req, res){
	    res.sendStatus(404);
	});

}
