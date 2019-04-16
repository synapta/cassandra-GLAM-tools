Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

function arrayMin(arr) {
    var len = arr.length, min = Infinity;
    while (len--) {
        if (arr[len] < min) {
            min = arr[len];
        }
    }
    return min;
};

function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
};

var categoryGraph = function (req, res, db) {
    db.query('SELECT page_title,cat_files,cl_to[0:10],cat_level[0:10] from categories', (err, dbres) => {
        if (!err) {
            var result = Object();
            result.nodes = [];
            result.edges = [];
            i = 0;
            while (i < dbres.rows.length) {
                node = Object();
                node.id = dbres.rows[i].page_title;
                node.files = dbres.rows[i].cat_files;
                node.group = arrayMin(dbres.rows[i].cat_level);
                j = 0;
                while (j < dbres.rows[i].cl_to.length) {
                    edge = Object();
                    edge.target = dbres.rows[i].cl_to[j];
                    edge.source = dbres.rows[i].page_title;
                    if (edge.target != "ROOT")
                        result.edges[result.edges.length] = edge;
                    j++;
                }
                result.nodes[i] = node;

                i++;
            }
            res.json(result);
        } else {
            console.log(err);
            res.sendStatus(400);
        }
    })
}

function glamToJson(glam) {
    return {
        'name': glam['name'],
        'fullname': glam['fullname'],
        'category': "Category:" + glam['category'],
        'image': glam['image']
    };
}

var glams = function (req, res, glams, admin) {
    let result = [];

    for (var id in glams) {
        if (!glams.hasOwnProperty(id))
            continue;

        json = glamToJson(glams[id]);

        if (admin) {
            json['lastrun'] = glams[id]['lastrun'];
            json['paused'] = glams[id]['paused'];
        } else {
            if (glams[id]['paused'] || glams[id]['lastrun'] === null) {
                continue;
            }
        }

        result.push(json);
    }

    res.json(result);
}

var getAdminGlam = function (req, res, glam) {
    let result = glamToJson(glam);
    result['lastrun'] = glam['lastrun'];
    result['paused'] = glam['paused'];
    res.json(result);
}

var createGlam = function (req, res, config) {
    let glam = {};

    let name = req.body['name'];
    if (name === undefined || name === '' || name in config.glams || name.includes(' ')) {
        res.sendStatus(400);
        return;
    }

    glam['name'] = name;
    glam['database'] = name.toLowerCase();

    let fullname = req.body['fullname'];
    if (fullname === undefined || fullname === '') {
        res.sendStatus(400);
        return;
    }

    glam['fullname'] = fullname;

    let category = req.body['category'];
    if (category === undefined || category === '') {
        res.sendStatus(400);
        return;
    }

    category = category.replace('Category:', '');
    category = category.replace(/_/g, ' ');
    glam['category'] = category;

    let image = req.body['image'];
    if (image === undefined || image === '' || image.includes(' ') || !image.startsWith('http')) {
        res.sendStatus(400);
        return;
    }

    glam['image'] = image;

    // Password is optional
    let password = req.body['password'];
    if (password !== undefined && password !== '') {
        glam['http-auth'] = {
            'username': glam['database'],
            'password': password
        };
    }

    config.insertGlam(glam);
    res.sendStatus(200);
}

var updateGlam = function (req, res, config) {
    let glam = { 'name': req.params.id };

    let fullname = req.body['fullname'];
    if (fullname !== undefined && fullname !== '') {
        glam['fullname'] = fullname;
    }

    let category = req.body['category'];
    if (category !== undefined && category !== '') {
        category = category.replace('Category:', '');
        category = category.replace(/_/g, ' ');
        glam['category'] = category;
    }

    let image = req.body['image'];
    if (image !== undefined && image !== '' && !image.includes(' ') && image.startsWith('http')) {
        glam['image'] = image;
    }

    // Password is optional
    let password = req.body['password'];
    if (password !== undefined) {
        if (password === '') {
            // Remove password
            glam['http-auth'] = undefined;
        } else {
            glam['http-auth'] = {
                'username': glam['name'].toLowerCase(),
                'password': password
            };
        }
    }

    // Paused is optional
    let paused = req.body['paused'];
    if (paused === true) {
        glam['paused'] = true;
    } else if (paused === false) {
        glam['paused'] = false;
    }

    config.updateGlam(glam);
    res.sendStatus(200);
};

var getGlam = function (req, res, glam) {
    glam.connection.query('SELECT COUNT(*) as value from images', (err, dbres) => {
        if (!err) {
            let result = {};
            result.fullname = glam.fullname;
            result.category = 'Category:' + glam.category;
            result.files = parseInt(dbres.rows[0]['value']);
            res.json(result);
        } else {
            console.log(err);
            res.sendStatus(400);
        }
    })
}

// USER CONTRIBUTIONS
var uploadDate = function (req, res, db) {
    let query = `select sum(img_count) as img_sum, img_user_text, array_agg(img_count) as img_count, array_agg(img_time) as img_time
        from (select count(*) as img_count, img_user_text, to_char(img_timestamp, 'YYYY-MM') as img_time
        from images`;

    // start and end are defined, convert them to timestamp and append
    if (req.query.start !== undefined) {
        splitted = req.query.start.split('-');
        start_timestamp = "'" + parseInt(splitted[0]) + "-" + parseInt(splitted[1]) + "-1 00:00:00'";
        query += " where img_timestamp>=" + start_timestamp;
    }
    
    if (req.query.end !== undefined) {
        splitted = req.query.end.split('-');
        end_timestamp = "'" + parseInt(splitted[0]) + "-" + parseInt(splitted[1]) + "-1 00:00:00'";
        if (req.query.start == undefined)
            query += " where ";
        else
            query += " and ";
        query += "img_timestamp<=" + end_timestamp;
    }
    
    query += ` group by img_user_text, img_time order by img_time) t
        group by img_user_text`
    
    if (req.query.sort !== undefined) {
        if (req.query.sort === 'name') {
            query += " order by img_user_text";
        } else if (req.query.sort === 'total') {
            query += " order by img_sum desc";
        } else {
            // Wrong value
            query += " order by img_sum desc";   
        }
    } else {
        // Default order
        query += " order by img_sum desc";
    }

    let page = 0;
    if (req.query.page !== undefined) {
        page = parseInt(req.query.page);
    }

    let limit = 10;
    if (req.query.limit !== undefined) {
        limit = parseInt(req.query.limit);
    }

    let offset = limit * page;

    query += " limit " + limit + " offset " + offset;

    db.query(query, (err, dbres) => {
        if (!err) {
            let result = [];
            i = 0;
            dbres.rows.forEach(function (row) {
                let user = {};
                user.user = row.img_user_text;
                user.total = parseInt(row.img_sum);
                user.files = [];
                let i = 0;
                while (i < row.img_time.length) {
                    let file = {};
                    file.date = row.img_time[i];
                    file.count = parseInt(row.img_count[i]);
                    user.files.push(file);
                    i++;
                }
                result.push(user);
            });
            res.json(result);
        } else {
            console.log(err);
            res.sendStatus(400);
        }
    })
}

var uploadDateAll = function (req, res, db) {
    let query = `select count(*) as count, to_char(img_timestamp, 'YYYY-MM') as date
                 from images`;

    if (req.query.start !== undefined) {
        splitted = req.query.start.split('-');
        start_timestamp = "'" + parseInt(splitted[0]) + "-" + parseInt(splitted[1]) + "-1 00:00:00'";
        query += " where img_timestamp>=" + start_timestamp;
    }
    
    if (req.query.end !== undefined) {
        splitted = req.query.end.split('-');
        end_timestamp = "'" + parseInt(splitted[0]) + "-" + parseInt(splitted[1]) + "-1 00:00:00'";
        if (req.query.start == undefined)
            query += " where ";
        else
            query += " and ";
        query += "img_timestamp<=" + end_timestamp;
    }
    
    query += " group by date order by date";

    db.query(query, (err, dbres) => {
        if (!err) {
            let result = [];
            dbres.rows.forEach(function (row) {
                let date = {"count": parseInt(row.count),
                            "date": row.date};
                result.push(date);
            });
            res.json(result);
        } else {
            console.log(err);
            res.sendStatus(400);
        }
    })
}

// USAGE
var usage = function (req, res, db) {
    let query = `select gil_to, array_agg(gil_wiki) as gil_wiki, array_agg(gil_page_title) as gil_page_title,
                    count(gil_page_title) as usage, count(distinct gil_wiki) as projects
                    from usages
                    where is_alive=true
                    group by gil_to`;
    
    if (req.query.sort !== undefined) {
        if (req.query.sort === 'usage') {
            query += " order by usage desc";
        } else if (req.query.sort === 'projects') {
            query += " order by projects desc";
        } else if (req.query.sort === 'name') {
            query += " order by gil_to";
        } else {
            // Wrong value
            query += " order by usage desc";   
        }
    } else {
        // Default order
        query += " order by usage desc";
    }

    let page = 0;
    if (req.query.page !== undefined) {
        page = parseInt(req.query.page);
    }

    let limit = 10;
    if (req.query.limit !== undefined) {
        limit = parseInt(req.query.limit);
    }

    let offset = limit * page;

    query += " limit " + limit + " offset " + offset;

    db.query(query, (err, dbres) => {
        if (!err) {
            let result = [];
            dbres.rows.forEach(function (row) {
                let usage = {
                    "image": row.gil_to,
                    "usage": parseInt(row.usage),
                    "projects": parseInt(row.projects),
                    "pages": []
                };
                let i = 0;
                while (i < row.gil_wiki.length) {
                    let page = {
                        "wiki": row.gil_wiki[i],
                        "title": row.gil_page_title[i]
                    };
                    i++;
                    usage.pages.push(page);
                }
                result.push(usage);
            });
            res.json(result);
        } else {
            console.log(err);
            res.sendStatus(400);
        }
    });
}

var usageStats = function (req, res, db) {
    let totalUsageQuery = `select count(*) as c, count(distinct gil_to) as d
                            from usages
                            where is_alive = true`;
    let totalProjectsQuery = `select count(distinct gil_wiki) as c, count(gil_to) as p
                              from usages
                              where is_alive = true`;

    db.query(totalUsageQuery, (err, totalUsage) => {
        if (!err) {
            db.query(totalProjectsQuery, (err, totalProjects) => {
                if (!err) {
                    let result = {};
                    result.totalUsage = parseInt(totalUsage.rows[0].c);
                    result.totalImagesUsed = parseInt(totalUsage.rows[0].d);
                    result.totalProjects = parseInt(totalProjects.rows[0].c);
                    result.totalPages = parseInt(totalProjects.rows[0].p);
                    res.json(result);
                } else {
                    console.log(err);
                    res.sendStatus(400);
                }
            });
        } else {
            console.log(err);
            res.sendStatus(400);
        }
    });
}

var usageTop = function (req, res, db) {
    let query = `select gil_wiki as wiki, count(*) as usage
                from usages
                where is_alive = true
                group by gil_wiki
                order by usage desc
                limit 10`;

    db.query(query, (err, dbres) => {
        if (!err) {
            let result = [];
            dbres.rows.forEach(function (row) {
                let wiki = {
                    "wiki": row.wiki,
                    "usage": parseInt(row.usage)
                }
                result.push(wiki);
            });
            res.json(result);
        } else {
            console.log(err);
            res.sendStatus(400);
        }
    });
}

// TODO this api should be deprecated because it is functionally equivalent to usage api
var usageSidebar = function (req, res, db) {
    let usage = `select gil_to, count(distinct gil_wiki) as wiki, count(*) as u
                 from usages
                 where is_alive = true
                 group by gil_to
                 order by u desc, wiki desc
                 limit 1000`;

    db.query(usage, (err, dbres) => {
        if (!err) {
            res.json(dbres.rows);
        } else {
            console.log(err);
            res.sendStatus(400);
        }
    });
}

// VIEWS
// TODO this api should be deprecated as it seems not used
var viewsAll = function (req, res, db) {
    db.query('select sum(accesses) as sum from visualizations', (err, dbres) => {
        if (!err) {
            res.json({"sum": parseInt(dbres.rows[0].sum)});
        } else {
            console.log(err);
            res.sendStatus(400);
        }
    });
}

var viewsByDate = function (req, res, db) {
    let query = `select sum(accesses) as sum, access_date
                 from visualizations`;

    if (req.query.start !== undefined) {
        splitted = req.query.start.split('-');
        start_timestamp = "'" + parseInt(splitted[0]) + "-" + parseInt(splitted[1]) + "-1 00:00:00'";
        query += " where access_date>=" + start_timestamp;
    }
    
    if (req.query.end !== undefined) {
        splitted = req.query.end.split('-');
        end_timestamp = "'" + parseInt(splitted[0]) + "-" + parseInt(splitted[1]) + "-1 00:00:00'";
        if (req.query.start == undefined)
            query += " where ";
        else
            query += " and ";
        query += "access_date<=" + end_timestamp;
    }

    query += " group by access_date order by access_date";

    db.query(query, (err, dbres) => {
        if (!err) {
            result = [];
            dbres.rows.forEach(function (row) {
                let date = {
                    "date": row.access_date.addHours(1).toISOString().substring(0, 10),
                    "views": parseInt(row.sum)
                };
                result.push(date);
            })
            res.json(result);
        } else {
            console.log(err);
            res.sendStatus(400);
        }
    });
}

var viewsByFiles = function (req, res, db) {
    let query = `select img_name, sum(accesses) as sum, access_date
                  from visualizations, images
                  where images.is_alive = true
                  and images.media_id = visualizations.media_id`;

    if (req.query.file !== undefined) {
        query += " and img_name = $1";
    } else {
        res.sendStatus(400);
        return; 
    }

    if (req.query.start !== undefined) {
        splitted = req.query.start.split('-');
        start_timestamp = "'" + parseInt(splitted[0]) + "-" + parseInt(splitted[1]) + "-1 00:00:00'";
        query += " and img_timestamp>=" + start_timestamp;
    }
    
    if (req.query.end !== undefined) {
        splitted = req.query.end.split('-');
        end_timestamp = "'" + parseInt(splitted[0]) + "-" + parseInt(splitted[1]) + "-1 00:00:00'";
        query += " and img_timestamp<=" + end_timestamp;
    }

    query += " group by img_name, access_date order by img_name, access_date";

    db.query(query, [req.query.file], (err, dbres) => {
        if (!err) {
            let result = [];
            dbres.rows.forEach(function (row) {
                let date = {
                    "sum": parseInt(row.sum),
                    "access_date": row.access_date.addHours(1).toISOString().substring(0, 10)
                };
                result.push(date);
            });
            res.json(result);
        } else {
            console.log(err);
            res.sendStatus(400);
        }
    });
}

var viewsSidebar = function (req, res, db) {
    let query = `select i.img_name, sum(v.accesses) as tot, avg(v.accesses) as av, PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER by v.accesses) as median
                  from images as i, visualizations as v
                  where i.media_id = v.media_id
                  and i.is_alive = true
                  group by i.img_name`;

    if (req.query.sort !== undefined) {
        if (req.query.sort === 'views') {
            query += " order by tot desc";
        } else if (req.query.sort === 'median') {
            query += " order by median desc";
        } else if (req.query.sort === 'name') {
            query += " order by i.img_name";
        } else {
            // Wrong value
            query += " order by tot desc";
        }
    } else {
        // Default order
        query += " order by tot desc";
    }

    let page = 0;
    if (req.query.page !== undefined) {
        page = parseInt(req.query.page);
    }

    let limit = 100;
    if (req.query.limit !== undefined) {
        limit = parseInt(req.query.limit);
    }

    let offset = limit * page;

    query += " limit " + limit + " offset " + offset;

    db.query(query, (err, dbres) => {
        if (!err) {
            let result = [];
            dbres.rows.forEach(function (row) {
                let view = {
                    "img_name": row.img_name,
                    "tot": parseInt(row.tot),
                    "av": parseFloat(row.av),
                    "median": parseFloat(row.median)
                };
                result.push(view);
            })
            res.json(result);
        } else {
            console.log(err);
            res.sendStatus(400);
        }
    });
}

exports.glams = glams;
exports.getAdminGlam = getAdminGlam;
exports.createGlam = createGlam;
exports.updateGlam = updateGlam;
exports.getGlam = getGlam;
exports.categoryGraph = categoryGraph;
exports.uploadDate = uploadDate;
exports.uploadDateAll = uploadDateAll;
exports.usage = usage;
exports.usageStats = usageStats;
exports.usageTop = usageTop;
exports.usageSidebar = usageSidebar;
exports.viewsByDate = viewsByDate;
exports.viewsByFiles = viewsByFiles;
exports.viewsAll = viewsAll;
exports.viewsSidebar = viewsSidebar;
