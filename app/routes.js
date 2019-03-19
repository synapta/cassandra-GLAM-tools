var express = require('express');
var api = require('./api.js');
var config = require('../config/config.js');
var auth = require('http-auth');

var DBConnections=[];

function getDatabase(id){
    index = config.getIndexOfDb(id, DBConnections);
    if(index !== -1)
        return DBConnections[index].connection;
    else {
        index = config.getIndexOfDb(id, config.DBs);
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

function getIdFromPath(path) {
    let exploded = path.split('/')
    if (path.startsWith('/api/')) {
        return exploded[2];
    } else {
        return exploded[1];
    }
}

module.exports = function(app, apicache) {

  app.use('/',express.static(__dirname + '/pages'));

  app.get('/docs', function(req, res){
      res.sendFile(__dirname + '/pages/docs.html');
  });

  app.get('/404', function(req, res){
	    res.sendStatus(404);
	});

  app.get('/500', function(req, res){
	    res.sendStatus(500);
	});

  app.use(function(req, res, next) {
    let id = getIdFromPath(req.path);
    let index = config.getIndexOfDb(id, config.DBs);

    if (index === -1) {
        next();
    } else if (config.DBs[index].hasOwnProperty('http-auth') === false) {
        next();
    } else {
        let auth_config = config.DBs[index]['http-auth'];
        let auth_basic = auth.basic({
            realm: auth_config['realm']
        }, function (username, password, callback) {
            callback(username === auth_config['username']
                && password === auth_config['password']);
        });
        (auth.connect(auth_basic))(req, res, next);
    }
  });

  //VIEWS

  app.get('/:id', apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
          response.sendFile(__dirname + '/pages/views/index.html');
      } else {
          response.sendStatus(400);
      }
  });
  app.get('/:id/category-network', apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
          response.sendFile(__dirname + '/pages/views/category-network/index.html');
      } else {
          response.sendStatus(400);
      }
  });
  app.get('/:id/user-contributions', apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
          response.sendFile(__dirname + '/pages/views/user-contributions/index.html');
      } else {
          response.sendStatus(400);
      }
  });
  app.get('/:id/usage', apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
          response.sendFile(__dirname + '/pages/views/usage/index.html');
      } else {
          response.sendStatus(400);
      }
  });
  app.get('/:id/page-views', apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
          response.sendFile(__dirname + '/pages/views/page-views/index.html');
      } else {
          response.sendStatus(400);
      }
  });

  //API

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
  app.get('/api/:id/views/files', apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
          api.viewsByFiles(request, response, request.params.id, db);
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

  //NOT FOUND

	app.get('*', function(req, res){
	    res.sendStatus(404);
	});

}
