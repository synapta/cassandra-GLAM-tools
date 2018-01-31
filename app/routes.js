var express = require('express');
var api = require('./api.js');
var config = require('./config.js');
var path = require('path');

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
  app.use('/',express.static(__dirname + '/pages'));

  app.use('/:id',express.static(__dirname + '/pages/views'));

	app.get('/api/:id/category/', apicache("1 hour"), function (request, response) {
	    let db = getDatabase(request.params.id);
	    if (db !== null) {
		      api.categoryGraph(request, response, request.params.id, db);
	    } else {
		      response.sendStatus(400);
	    }
	});
	app.get('/api/:id/rootcategory/', apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
		      api.rootCategory(request, response, request.params.id, db);
	    } else {
		      response.sendStatus(400);
	    }
	});
  app.get('/api/:id/totalMediaNum/', apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
		      api.totalMediaNum(request, response, request.params.id, db);
	    } else {
		      response.sendStatus(400);
	    }
	});
	app.get('/api/:id/views/by-date', apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
		      api.viewsByDate(request, response, request.params.id, db);
	    } else {
		      response.sendStatus(400);
	    }
	});
	app.get('/api/:id/views/all', apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
		      api.viewsAll(request, response, request.params.id, db);
	    } else {
		      response.sendStatus(400);
	    }
	});
  app.get('/api/:id/views/sidebar', apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
          api.viewsSidebar(request, response, request.params.id, db);
      } else {
          response.sendStatus(400);
      }
  });
	app.get('/api/:id/usage/', apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
		      api.usage(request, response, request.params.id, db);
	    } else {
		      response.sendStatus(400);
	    }
	});
  app.get('/api/:id/usage/stat', apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
		      api.usageStat(request, response, request.params.id, db);
	    } else {
		      response.sendStatus(400);
	    }
	});
  app.get('/api/:id/usage/top', apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
		      api.usageTop(request, response, request.params.id, db);
	    } else {
		      response.sendStatus(400);
	    }
	});
  app.get('/api/:id/usage/sidebar', apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
          api.usageSidebar(request, response, request.params.id, db);
      } else {
          response.sendStatus(400);
      }
  });
	app.get('/api/:id/file/upload-date', apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
		      api.uploadDate(request, response, request.params.id, request.query.start, request.query.end, db);
	    } else {
		      response.sendStatus(400);
	    }
	});
  app.get('/api/:id/file/upload-date-all', apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
          api.uploadDateAll(request, response, request.params.id, db);
      } else {
          response.sendStatus(400);
      }
  });

	app.get('/docs', function(req, res){
	    res.sendFile(path.resolve('../docs/docs.html'));
	});

  app.get('/', function(req, res){
	    res.sendFile(__dirname + '/pages/index.html');
	});

	app.get('*', function(req, res){
	    res.sendStatus(404);
	});

}
