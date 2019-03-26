var express = require('express');
var api = require('./api.js');
var auth = require('http-auth');

var config = require('../config/config.js');
config.loadGlams();

module.exports = function (app, apicache) {

    app.use('/', express.static(__dirname + '/pages'));

    app.get('/docs', function (req, res) {
        res.sendFile(__dirname + '/pages/docs.html');
    });

    app.get('/404', function (req, res) {
        res.sendStatus(404);
    });

    app.get('/500', function (req, res) {
        res.sendStatus(500);
    });

    app.use(function (req, res, next) {
        function getId(path) {
            let exploded = path.split('/')
            if (path.startsWith('/api/')) {
                return exploded[2];
            } else {
                return exploded[1];
            }
        }

        function createAuth(auth_config) {
            let auth_basic = auth.basic({
                realm: auth_config['realm']
            }, function (username, password, callback) {
                callback(username === auth_config['username']
                    && password === auth_config['password']);
            });
            (auth.connect(auth_basic))(req, res, next);
        }

        let id = getId(req.path);

        if (id === 'admin') {
            createAuth(config.admin);
        } else {
            let glam = config.glams[id];

            if (glam === undefined) {
                next();
            } else if (glam.hasOwnProperty('http-auth') === false) {
                next();
            } else {
                createAuth(glam['http-auth']);
            }
        }
    });

    //VIEWS
    app.get('/:id', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            response.sendFile(__dirname + '/pages/views/index.html');
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/:id/category-network', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            response.sendFile(__dirname + '/pages/views/category-network/index.html');
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/:id/user-contributions', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            response.sendFile(__dirname + '/pages/views/user-contributions/index.html');
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/:id/usage', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            response.sendFile(__dirname + '/pages/views/usage/index.html');
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/:id/page-views', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            response.sendFile(__dirname + '/pages/views/page-views/index.html');
        } else {
            response.sendStatus(400);
        }
    });

    //API
    app.get('/api/glams', apicache("1 hour"), function (request, response) {
        api.glams(request, response, config.glams);
    });

    app.get('/api/admin/glams', function (request, response) {
        api.glams(request, response, config.glams);
    });

    app.post('/api/admin/glams', function (request, response) {
        api.createGlam(request, response, config);
    });

    app.get('/api/admin/glams/:id', function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.getGlam(request, response, glam);
        } else {
            response.sendStatus(404);
        }
    });

    app.put('/api/admin/glams/:id', function (request, response) {
        response.sendStatus(501);
    });

    app.delete('/api/admin/glams/:id', function (request, response) {
        response.sendStatus(501);
    });

    app.get('/api/:id/category', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.categoryGraph(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/rootcategory', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.rootCategory(request, response, glam);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/totalMediaNum', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.totalMediaNum(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/views/by-date', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.viewsByDate(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/views/all', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.viewsAll(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/views/sidebar', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.viewsSidebar(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/views/files', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.viewsByFiles(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/usage/', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.usage(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/usage/stat', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.usageStat(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/usage/top', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.usageTop(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/usage/sidebar', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.usageSidebar(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/file/upload-date', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.uploadDate(request, response, request.query.start, request.query.end, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/file/upload-date-all', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.uploadDateAll(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    //NOT FOUND
    app.get('*', function (req, res) {
        res.sendStatus(404);
    });

}
