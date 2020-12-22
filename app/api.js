const stringify = require('csv-stringify');

Date.prototype.toISODateString = function () {
    let offset = this.getTimezoneOffset() * 60 * 1000;
    let local = new Date(this - offset);
    return local.toISOString().slice(0, 10);
}

function glamToJson(glam) {
    return {
        'name': glam['name'],
        'fullname': glam['fullname'],
        'category': "Category:" + glam['category'],
        'image': glam['image']
    };
}

// ADMIN
var glams = function (req, res, glams, admin) {
    let result = [];

    for (var id in glams) {
        if (!glams.hasOwnProperty(id))
            continue;

        json = glamToJson(glams[id]);

        if (admin) {
            json['lastrun'] = glams[id]['lastrun'];
            json['status'] = glams[id]['status'];
        } else {
            if (glams[id]['status'] !== 'running') {
                continue;
            }
        }

        result.push(json);
    }

    if (admin) {
        // Sort by decreasing timestamp
        result.sort((a, b) => {
            if (a['lastrun'] === null && b['lastrun'] === null) {
                return 0;
            }
            if (a['lastrun'] === null) {
                return 1;
            }
            if (b['lastrun'] === null) {
                return -1;
            }
            return b['lastrun'].getTime() - a['lastrun'].getTime();
        });
    }

    res.json(result);
}

var getAdminGlam = function (req, res, glam) {
    let result = glamToJson(glam);
    result['lastrun'] = glam['lastrun'];
    result['status'] = glam['status'];
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

    glam['status'] = 'pending';

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
        glam['status'] = 'paused';
    } else if (paused === false) {
        glam['status'] = 'pending';
    }

    config.updateGlam(glam);
    res.sendStatus(200);
};

var getGlam = function (req, res, next, glam) {
    let query = 'SELECT COUNT(*) as value from images';

    let parameters = [];

    if (req.query.cat !== undefined) {
        query += ` where cl_to && array( 
        with recursive subcategories as (
        select page_title, cl_to
        from categories
        where page_title = $1
        union
        select c.page_title, c.cl_to
        from categories c
        inner join subcategories s on s.page_title = any(c.cl_to))
        select distinct page_title
        from subcategories)`;
        parameters.push(req.query.cat);
    }

    glam.connection.query(query, parameters, (err, dbres) => {
        if (!err) {
            let result = {};
            result.fullname = glam.fullname;
            result.category = 'Category:' + glam.category;
            result.files = parseInt(dbres.rows[0]['value']);
            result.image = glam.image;
            res.json(result);
        } else {
            next(new Error(err));
        }
    });
};

// ANNOTATIONS
var getAnnotations = function (req, res, next, glam) {
    glam.connection.query('SELECT * FROM annotations', (err, dbres) => {
        if (!err) {
            let result = [];
            dbres.rows.forEach((row => {
                result.push({
                    'date': row['annotation_date'].toISODateString(),
                    'annotation': row['annotation_value'],
                    'position': row['annotation_position']
                });
            }));
            res.json(result);
        } else {
            next(new Error(err));
        }
    });
};

var getAnnotation = function (req, res, next, glam) {
    glam.connection.query('SELECT * FROM annotations WHERE annotation_date = $1', [req.params.date], (err, dbres) => {
        if (!err) {
            if (dbres.rows.length == 1) {
                let row = dbres.rows[0];
                let result = {
                    'date': row['annotation_date'].toISODateString(),
                    'annotation': row['annotation_value'],
                    'position': row['annotation_position']
                };
                res.json(result);
            } else {
                res.sendStatus(404);
            }
        } else {
            next(new Error(err));
        }
    });
};

var modifyAnnotation = function (req, res, next, glam) {
    let annotation = req.body['annotation'];
    if (annotation === undefined || annotation === '') {
        res.sendStatus(400);
        return;
    }

    let position = req.body['position'];
    if (position === undefined || position === '') {
        res.sendStatus(400);
        return;
    }

    glam.connection.query('UPDATE annotations SET annotation_value = $2, annotation_position = $3 WHERE annotation_date = $1', [req.params.date, annotation, position], (err, dbres) => {
        if (!err) {
            res.sendStatus(200);
        } else {
            next(new Error(err));
        }
    });
};

var createAnnotation = function (req, res, next, glam) {
    let annotation = req.body['annotation'];
    if (annotation === undefined || annotation === '') {
        res.sendStatus(400);
        return;
    }

    let position = req.body['position'];
    if (position === undefined || position === '') {
        res.sendStatus(400);
        return;
    }

    glam.connection.query('INSERT INTO annotations (annotation_date, annotation_value, annotation_position) VALUES ($1, $2, $3)', [req.params.date, annotation, position], (err, dbres) => {
        if (!err) {
            res.sendStatus(200);
        } else {
            next(new Error(err));
        }
    });
};

var deleteAnnotation = function (req, res, next, glam) {
    glam.connection.query('DELETE FROM annotations WHERE annotation_date = $1', [req.params.date], (err, dbres) => {
        if (!err) {
            res.sendStatus(200);
        } else {
            next(new Error(err));
        }
    });
};

// CATEGORY NETWORK
function arrayMin(arr) {
    var len = arr.length, min = Infinity;
    while (len--) {
        if (arr[len] < min) {
            min = arr[len];
        }
    }
    return min;
};

function categoryGraphQuery(unused, filter) {
    let query = `SELECT page_title, cat_files, cl_to[0:10], cat_level[0:10]
                FROM categories`;

    if (unused === true) {
        query = `SELECT c.page_title, COUNT(DISTINCT i.img_name) AS cat_files, c.cl_to[0:10], c.cat_level[0:10]
                FROM categories c
                LEFT JOIN images i ON c.page_title = ANY(i.cl_to)
                LEFT JOIN usages u ON i.img_name = u.gil_to
                WHERE (i.is_alive = TRUE OR i.is_alive IS NULL)
                AND u.is_alive IS NULL`;
    }
    if (filter === true) {
        if (unused === true) {
            query += `
                AND c.page_title `;
        } else {
            query += `
                WHERE page_title `;
        }

        query += `in (
                    with recursive subcategories as (
                            select page_title, cl_to
                            from categories
                            where page_title = $1
                            union
                            select c.page_title, c.cl_to
                            from categories c
                            inner join subcategories s on s.page_title = any(c.cl_to))
                            select distinct page_title
                            from subcategories)`;
    }

    if (unused === true) {
        query += `
            GROUP BY page_title`;
    }

    query += `
        ORDER BY cat_level, page_title`;

    return query;
}

var categoryGraph = function (req, res, next, db) {
    let unused = false;
    let cat = false;
    let parameters = [];

    if (req.query.unused === 'true') {
        unused = true;
    }

    if (req.query.cat !== undefined) {
        cat = true;
        parameters.push(req.query.cat);
    }

    db.query(categoryGraphQuery(unused, cat), parameters, (err, dbres) => {
        if (!err) {
            let result = {};
            result.nodes = [];
            result.edges = [];
            let ids = [];
            let edges = [];
            dbres.rows.forEach(function (row) {
                let node = {};
                node.id = row.page_title;
                ids.push(node.id);
                node.files = parseInt(row.cat_files);
                node.group = arrayMin(row.cat_level);
                row.cl_to.forEach(function (target) {
                    let edge = {};
                    edge.target = target;
                    edge.source = row.page_title;
                    if (edge.target != "ROOT")
                        edges.push(edge);
                });
                result.nodes.push(node);
            });
            edges.forEach(function (edge) {
                if (ids.includes(edge.target)) {
                    result.edges.push(edge);
                }
            });
            res.json(result);
        } else {
            next(new Error(err));
        }
    });
}

var categoryGraphDataset = function (req, res, next, db) {
    db.query(categoryGraphQuery(req.query.unused), (err, dbres) => {
        if (!err) {
            res.set('Content-Type', 'text/csv');
            let stringifier = stringify({ 'delimiter': ';', 'record_delimiter': 'windows' });
            stringifier.pipe(res);
            stringifier.write(["Category", "Files", "Level"]);
            dbres.rows.forEach(function (row) {
                let line = [];
                line[0] = row.page_title;
                line[1] = row.cat_files;
                line[2] = arrayMin(row.cat_level);
                stringifier.write(line);
            });
            stringifier.end();
        } else {
            next(new Error(err));
        }
    });
}

var categoryFiles = function (req, res, next, db) {
    let query = `SELECT DISTINCT img_name
                FROM categories c
                LEFT JOIN images i ON c.page_title = ANY(i.cl_to)
                LEFT JOIN usages u ON i.img_name = u.gil_to
                WHERE c.page_title = $1
                ORDER BY img_name`;

    if (req.query.unused === 'true') {
        query = `SELECT DISTINCT img_name
                FROM categories c
                LEFT JOIN images i ON c.page_title = ANY(i.cl_to)
                LEFT JOIN usages u ON i.img_name = u.gil_to
                WHERE (u.is_alive = FALSE
                OR u.is_alive IS NULL)
                AND c.page_title = $1
                ORDER BY img_name`;
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

    let parameters = [req.params.category];

    db.query(query, parameters, (err, dbres) => {
        if (!err) {
            let result = [];
            dbres.rows.forEach(function (row) {
                result.push(row['img_name']);
            });
            res.json(result);
        } else {
            next(new Error(err));
        }
    });
}

// for USER CONTRIBUTIONS and VIEWS
function parseGroupBy(groupby, defaultGroupBy) {
    var parseGroupByWhitelist = [
        'day',
        'week',
        'month',
        'quarter',
        'year',
        'decade'  // available for future implementation
    ];
    if (parseGroupByWhitelist.indexOf(groupby) !== -1) {
        return groupby;
    }
    // Fallback for default or
    return typeof defaultGroupBy === 'undefined' ? 'month' : defaultGroupBy;
}

var uploadDate = function (req, res, next, db) {
    let groupby = parseGroupBy(req.query.groupby, 'month');
    let query = `select sum(img_count) as img_sum, img_user_text, array_agg(img_count) as img_count, array_agg(img_time) as img_time
        from (select count(*) as img_count, img_user_text, date_trunc('` + groupby + `', img_timestamp) as img_time
        from images`;

    let parameters = [];
    let param_index = 1;

    if (req.query.start !== undefined) {
        query += " where img_timestamp >= $" + param_index;
        parameters.push(req.query.start);
        param_index++;
    }

    if (req.query.end !== undefined) {
        if (req.query.start === undefined) {
            res.sendStatus(400);
            return;
        }
        query += " and img_timestamp <= $" + param_index;
        parameters.push(req.query.end);
        param_index++;
    }

    if (req.query.cat !== undefined) {
        query += ` where cl_to && array( 
        with recursive subcategories as (
        select page_title, cl_to
        from categories
        where page_title = $` + param_index + `
        union
        select c.page_title, c.cl_to
        from categories c
        inner join subcategories s on s.page_title = any(c.cl_to))
        select distinct page_title
        from subcategories)`;
        parameters.push(req.query.cat);
        param_index++;
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

    db.query(query, parameters, (err, dbres) => {
        if (!err) {
            let result = [];
            dbres.rows.forEach(function (row) {
                let user = {};
                user.user = row.img_user_text;
                user.total = parseInt(row.img_sum);
                user.files = [];
                let i = 0;
                while (i < row.img_time.length) {
                    let file = {};
                    file.date = row.img_time[i].toISODateString();
                    file.count = parseInt(row.img_count[i]);
                    user.files.push(file);
                    i++;
                }
                result.push(user);
            });
            res.json(result);
        } else {
            next(new Error(err));
        }
    });
}

var uploadDateDataset = function (req, res, next, db) {
    let groupby = parseGroupBy(req.params.timespan);

    let query = `select sum(img_count) as img_sum, img_user_text, array_agg(img_count) as img_count, array_agg(img_time) as img_time
        from (select count(*) as img_count, img_user_text, date_trunc('` + groupby + `', img_timestamp) as img_time
        from images`;

    let parameters = [];

    if (req.query.cat !== undefined) {
        query += ` where cl_to && array( 
        with recursive subcategories as (
        select page_title, cl_to
        from categories
        where page_title = $1
        union
        select c.page_title, c.cl_to
        from categories c
        inner join subcategories s on s.page_title = any(c.cl_to))
        select distinct page_title
        from subcategories)`;
        parameters.push(req.query.cat);
    }

    query += ` group by img_user_text, img_time order by img_time) t
        group by img_user_text
        order by img_sum desc`;

    db.query(query, parameters, (err, dbres) => {
        if (!err) {
            res.set('Content-Type', 'text/csv');
            let stringifier = stringify({ 'delimiter': ';', 'record_delimiter': 'windows' });
            stringifier.pipe(res);
            stringifier.write(["User", "Date", "Count"]);
            dbres.rows.forEach(function (row) {
                let user = row.img_user_text;
                let i = 0;
                while (i < row.img_time.length) {
                    let line = [];
                    line[0] = user;
                    line[1] = row.img_time[i].toISODateString();
                    line[2] = parseInt(row.img_count[i]);
                    stringifier.write(line);
                    i++;
                }
            });
            stringifier.end();
        } else {
            next(new Error(err));
        }
    });
};

var uploadDateAll = function (req, res, next, db) {
    let groupby = parseGroupBy(req.query.groupby);
    let query = `with min_max as (
                    select min(img_timestamp) as min_date, max(img_timestamp) as max_date
                    from images),
                date_range as (
                    select generate_series(date_trunc('` + groupby + `', min_date), date_trunc('` + groupby + `', max_date),
                    interval '` + (groupby === 'quarter' ? '3 month' : '1 ' + groupby) + `') date_value
                    from min_max),
                date_counts as (
                    select count(*) as count_value, date_trunc('` + groupby + `', img_timestamp) as date_count
                    from images`;

    let parameters = [];
    let param_index = 1;

    if (req.query.cat !== undefined) {
        query += ` where cl_to && array( 
        with recursive subcategories as (
        select page_title, cl_to
        from categories
        where page_title = $` + param_index + `
        union
        select c.page_title, c.cl_to
        from categories c
        inner join subcategories s on s.page_title = any(c.cl_to))
        select distinct page_title
        from subcategories)`;
        parameters.push(req.query.cat);
        param_index++;
    }

    query += ` group by date_count)
                select coalesce(count_value, 0) as count, date_value as date
                from date_range
                left outer join date_counts on date_value = date_count`;

    if (req.query.start !== undefined) {
        query += " where date_value >= $" + param_index;
        parameters.push(req.query.start);
        param_index++;
    }

    if (req.query.end !== undefined) {
        if (req.query.start === undefined) {
            res.sendStatus(400);
            return;
        }
        query += " and date_value <= $" + param_index;
        parameters.push(req.query.end);
        param_index++;
    }

    query += " order by date_value";

    db.query(query, parameters, (err, dbres) => {
        if (!err) {
            let result = [];
            dbres.rows.forEach(function (row) {
                let date = {
                    "count": parseInt(row.count),
                    "date": row.date.toISODateString()
                };
                result.push(date);
            });
            res.json(result);
        } else {
            next(new Error(err));
        }
    })
}

// USAGE
function getUsage(row) {
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
    return usage;
}

var usage = function (req, res, next, db) {
    let query = `select gil_to, array_agg(gil_wiki) as gil_wiki, array_agg(gil_page_title) as gil_page_title,
                    count(gil_page_title) as usage, count(distinct gil_wiki) as projects
                    from usages u`;

    let parameters = []

    if (req.query.cat !== undefined) {
        query += ` left join images on gil_to = img_name
                    where u.is_alive = true
                    and cl_to && array( 
                    with recursive subcategories as (
                    select page_title, cl_to
                    from categories
                    where page_title = $1
                    union
                    select c.page_title, c.cl_to
                    from categories c
                    inner join subcategories s on s.page_title = any(c.cl_to))
                    select distinct page_title
                    from subcategories)`;
        parameters.push(req.query.cat);
    } else {
        query += ` where u.is_alive = true`;
    }

    query += ` group by gil_to`;

    if (req.query.sort !== undefined) {
        if (req.query.sort === 'usage') {
            query += " order by usage desc, gil_to";
        } else if (req.query.sort === 'projects') {
            query += " order by projects desc, gil_to";
        } else if (req.query.sort === 'name') {
            query += " order by gil_to";
        } else {
            // Wrong value
            query += " order by usage desc, gil_to";
        }
    } else {
        // Default order
        query += " order by usage desc, gil_to";
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

    db.query(query, parameters, (err, dbres) => {
        if (!err) {
            let result = [];
            dbres.rows.forEach(function (row) {
                result.push(getUsage(row));
            });
            res.json(result);
        } else {
            next(new Error(err));
        }
    });
}

var usageDataset = function (req, res, next, db) {
    let query = `select gil_to, array_agg(gil_wiki) as gil_wiki, array_agg(gil_page_title) as gil_page_title,
                    count(gil_page_title) as usage, count(distinct gil_wiki) as projects
                    from usages u`;

    let parameters = [];

    if (req.query.cat !== undefined) {
        query += ` left join images on gil_to = img_name
                    where u.is_alive = true
                    and cl_to && array( 
                    with recursive subcategories as (
                    select page_title, cl_to
                    from categories
                    where page_title = $1
                    union
                    select c.page_title, c.cl_to
                    from categories c
                    inner join subcategories s on s.page_title = any(c.cl_to))
                    select distinct page_title
                    from subcategories)`;
        parameters.push(req.query.cat);
    } else {
        query += ` where u.is_alive = true`;
    }

    query += ` group by gil_to
                order by usage desc, gil_to`;

    db.query(query, parameters, (err, dbres) => {
        if (!err) {
            res.set('Content-Type', 'text/csv');
            let stringifier = stringify({ 'delimiter': ';', 'record_delimiter': 'windows' });
            stringifier.pipe(res);
            stringifier.write(["File", "Project", "Page"]);
            dbres.rows.forEach(function (row) {
                let i = 0;
                while (i < row.gil_wiki.length) {
                    let line = [
                        row.gil_to,
                        row.gil_wiki[i],
                        row.gil_page_title[i]
                    ];
                    stringifier.write(line);
                    i++;
                }
            });
            stringifier.end();
        } else {
            next(new Error(err));
        }
    });
}

var usageFile = function (req, res, next, db) {
    let query = `select gil_to, array_agg(gil_wiki) as gil_wiki, array_agg(gil_page_title) as gil_page_title,
                    count(gil_page_title) as usage, count(distinct gil_wiki) as projects
                    from usages
                    where is_alive = true
                    and gil_to = $1
                    group by gil_to`;

    db.query(query, [req.params.file], (err, dbres) => {
        if (!err) {
            let result = [];
            dbres.rows.forEach(function (row) {
                result.push(getUsage(row));
            });
            res.json(result);
        } else {
            next(new Error(err));
        }
    });
}

var usageStats = function (req, res, next, db) {
    let query = `select count(distinct gil_to) as images, count(distinct gil_wiki) as projects, count(gil_to) as pages
                    from usages u`;

    let parameters = [];

    if (req.query.cat !== undefined) {
        query += ` left join images on gil_to = img_name
                    where u.is_alive = true
                    and cl_to && array( 
                    with recursive subcategories as (
                    select page_title, cl_to
                    from categories
                    where page_title = $1
                    union
                    select c.page_title, c.cl_to
                    from categories c
                    inner join subcategories s on s.page_title = any(c.cl_to))
                    select distinct page_title
                    from subcategories)`;
        parameters.push(req.query.cat);
    } else {
        query += ` where u.is_alive = true`;
    }

    db.query(query, parameters, (err, dbres) => {
        if (!err) {
            let result = {};
            result.totalImagesUsed = parseInt(dbres.rows[0].images);
            result.totalProjects = parseInt(dbres.rows[0].projects);
            result.totalPages = parseInt(dbres.rows[0].pages);
            res.json(result);
        } else {
            next(new Error(err));
        }
    });
}

var usageTop = function (req, res, next, db) {
    let query = `with top10 as
                (select gil_wiki as wiki, count(*) as usage
                from usages u`;

    let parameters = [];

    if (req.query.cat !== undefined) {
        query += ` left join images on gil_to = img_name
                    where u.is_alive = true
                    and cl_to && array( 
                    with recursive subcategories as (
                    select page_title, cl_to
                    from categories
                    where page_title = $1
                    union
                    select c.page_title, c.cl_to
                    from categories c
                    inner join subcategories s on s.page_title = any(c.cl_to))
                    select distinct page_title
                    from subcategories)`;
        parameters.push(req.query.cat);
    } else {
        query += ` where u.is_alive = true`;
    }

    query += ` group by gil_wiki
                order by usage desc
                limit 10)
                select *
                from top10
                union all
                select 'others' as wiki, count(*) as usage
                from usages`;

    if (req.query.cat !== undefined) {
        query += ` left join images on gil_to = img_name
                    where cl_to && array( 
                    with recursive subcategories as (
                    select page_title, cl_to
                    from categories
                    where page_title = $1
                    union
                    select c.page_title, c.cl_to
                    from categories c
                    inner join subcategories s on s.page_title = any(c.cl_to))
                    select distinct page_title
                    from subcategories)
                    and gil_wiki not in
                    (select wiki
                    from top10)`;
    } else {
        query += ` where gil_wiki not in
                    (select wiki
                    from top10)`;
    }

    db.query(query, parameters, (err, dbres) => {
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
            next(new Error(err));
        }
    });
}

// VIEWS
var views = function (req, res, next, db) {
    let query;
    let param_index = 0;
    let parameters = [];

    let groupby = parseGroupBy(req.query.groupby, 'week');

    if (req.query.cat === undefined) {
        query = `SELECT SUM(accesses_sum) AS accesses_sum_total,
                    -- ARRAY_AGG(accesses_sum) AS accesses_sum_list,
                    -- ARRAY_AGG(access_date) AS accesses_date_list,
                    DATE_TRUNC('${groupby}', access_date) AS access_date_grouped
                FROM
                    visualizations_sum`;
    } else {
        param_index++;
        parameters.push(req.query.cat);
        query = `SELECT SUM(accesses_sum) AS accesses_sum_total,
                    -- ARRAY_AGG(accesses_sum) AS accesses_sum_list,
                    -- ARRAY_AGG(access_date) AS accesses_date_list,
                    DATE_TRUNC('${groupby}', access_date) AS access_date_grouped
                FROM
                (SELECT sum(visualizations.accesses) AS accesses_sum,
                        visualizations.access_date
                FROM visualizations
                WHERE media_id IN
                    (SELECT media_id
                        FROM images i
                        WHERE cl_to && array
                            (WITH RECURSIVE subcategories AS
                            (SELECT page_title, cl_to
                                FROM categories
                                WHERE page_title = $${param_index}
                                UNION SELECT c.page_title, c.cl_to
                                FROM categories c
                                INNER JOIN subcategories s ON s.page_title = any(c.cl_to))
                            SELECT DISTINCT page_title
                            FROM subcategories))
                GROUP BY visualizations.access_date) visualizations_sum`;
    }

    if (req.query.start !== undefined) {
        param_index++;
        query += " WHERE access_date >= $" + param_index;
        parameters.push(req.query.start);
    }

    if (req.query.end !== undefined) {
        if (req.query.start === undefined) {
            res.sendStatus(400);
            return;
        }
        param_index++;
        query += " AND access_date <= $" + param_index;
        parameters.push(req.query.end);
    }

    query += `
    GROUP BY
        access_date_grouped
    ORDER BY
        access_date_grouped`;

    db.query(query, parameters, (err, dbres) => {
        if (!err) {
            result = [];
            dbres.rows.forEach(function (row) {
                let date = {
                    "date": row.access_date_grouped.toISODateString(),
                    "views": parseInt(row.accesses_sum_total),
                };
                result.push(date);
            })
            res.json(result);
        } else {
            next(new Error(err));
        }
    });
}

var viewsDataset = function (req, res, next, db) {
    let groupby = parseGroupBy(req.params.timespan);
    let query = `SELECT
    SUM(accesses_sum) AS accesses_sum_total,
    -- ARRAY_AGG(accesses_sum) AS accesses_sum_list,
    -- ARRAY_AGG(access_date) AS accesses_date_list,
    DATE_TRUNC('${groupby}', access_date)::DATE AS access_date_grouped
FROM
    visualizations_sum
GROUP BY
        access_date_grouped
    ORDER BY
        access_date_grouped`;

    db.query(query, (err, dbres) => {
        if (!err) {
            res.set('Content-Type', 'text/csv');
            let stringifier = stringify({ 'delimiter': ';', 'record_delimiter': 'windows' });
            stringifier.pipe(res);
            stringifier.write(["Date", "Views"]);
            dbres.rows.forEach(function (row) {
                let line = [
                    row.access_date_grouped.toISODateString(),
                    parseInt(row.accesses_sum_total)
                ];
                stringifier.write(line);
            })
            stringifier.end();
        } else {
            next(new Error(err));
        }
    });
}

var viewsByFile = function (req, res, next, db) {
    let groupby = parseGroupBy(req.query.groupby, 'week');
    let query = `select img_name, sum(accesses) as sum,
                    DATE_TRUNC($1, access_date) AS access_date_grouped
                    from visualizations, images
                    where images.is_alive = true
                    and images.media_id = visualizations.media_id
                    and img_name = $2`;

    let parameters = [
        groupby,
        req.params.file
    ];

    if (req.query.start !== undefined) {
        query += " and access_date >= $3";
        parameters.push(req.query.start);
    }

    if (req.query.end !== undefined) {
        if (req.query.start === undefined) {
            res.sendStatus(400);
            return;
        }
        query += " and access_date <= $4";
        parameters.push(req.query.end);
    }

    query += " group by img_name, access_date_grouped order by img_name, access_date_grouped";

    db.query(query, parameters, (err, dbres) => {
        if (!err) {
            let result = [];
            dbres.rows.forEach(function (row) {
                let date = {
                    "sum": parseInt(row.sum),
                    "access_date": row.access_date_grouped.toISODateString()
                };
                result.push(date);
            });
            res.json(result);
        } else {
            next(new Error(err));
        }
    });
}

var viewsSidebar = function (req, res, next, db) {
    let query = `select vs.img_name, tot, avg, median
                from visualizations_stats vs`;

    let parameters = [];

    if (req.query.cat !== undefined) {
        query += ` left join images i on vs.img_name = i.img_name
                    where cl_to && array( 
                    with recursive subcategories as (
                    select page_title, cl_to
                    from categories
                    where page_title = $1
                    union
                    select c.page_title, c.cl_to
                    from categories c
                    inner join subcategories s on s.page_title = any(c.cl_to))
                    select distinct page_title
                    from subcategories)`;
        parameters.push(req.query.cat);
    }

    if (req.query.sort !== undefined) {
        if (req.query.sort === 'views') {
            query += " order by tot desc";
        } else if (req.query.sort === 'median') {
            query += " order by median desc";
        } else if (req.query.sort === 'name') {
            query += " order by img_name";
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

    db.query(query, parameters, (err, dbres) => {
        if (!err) {
            let result = [];
            dbres.rows.forEach(function (row) {
                let view = {
                    "img_name": row.img_name,
                    "tot": parseInt(row.tot),
                    "av": parseFloat(row.avg),
                    "median": parseFloat(row.median)
                };
                result.push(view);
            })
            res.json(result);
        } else {
            next(new Error(err));
        }
    });
}

var viewsStats = function (req, res, next, db) {
    let query = `select count(img_name) as count
                from visualizations_stats`;

    db.query(query, (err, dbres) => {
        if (!err) {
            if (dbres.rows.length > 0) {
                let row = dbres.rows[0];
                let result = {
                    "total": parseInt(row.count)
                };
                res.json(result);
            } else {
                res.sendStatus(404);
            }
        } else {
            next(new Error(err));
        }
    });
}

// FILE
var fileDetails = function (req, res, next, db) {
    let query = `select i.img_name, sum(v.accesses) as tot, avg(v.accesses) as avg,
                PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER by v.accesses) as median,
                i.cl_to as categories
                from images as i, visualizations as v
                where i.media_id = v.media_id
                and i.img_name = $1
                group by i.img_name, categories`;

    db.query(query, [req.params.file], (err, dbres) => {
        if (!err) {
            if (dbres.rows.length > 0) {
                let result = {};
                let row = dbres.rows[0];

                result['tot'] = parseInt(row.tot);
                result['avg'] = parseFloat(row.avg);
                result['median'] = parseFloat(row.median);

                let uniq_cats = new Set();
                row.categories.forEach(function (cat) {
                    uniq_cats.add(cat.replace(/^[^=]*=/, ''));
                });
                result['categories'] = Array.from(uniq_cats);

                res.json(result);
            } else {
                res.sendStatus(404);
            }

        } else {
            next(new Error(err));
        }
    });
}

// SEARCH
var search = function (req, res, next, db) {
    let query = `SELECT img_name
                FROM images
                WHERE img_name ILIKE $1
                AND is_alive = TRUE
                ORDER BY img_name`;

    let page = 0;
    if (req.query.page !== undefined) {
        page = parseInt(req.query.page);
    }

    let limit = 100;
    if (req.query.limit !== undefined) {
        limit = parseInt(req.query.limit);
    }

    let offset = limit * page;

    query += " LIMIT " + limit + " OFFSET " + offset;

    db.query(query, [req.params.query], (err, dbres) => {
        if (!err) {
            let result = [];

            dbres.rows.forEach(function (row) {
                result.push(row['img_name']);
            });

            res.json(result);
        } else {
            next(new Error(err));
        }
    });
}

// RECOMMENDER
var recommender = function (req, res, next, db) {
    let query = `SELECT r.img_name, array_agg(title) as titles, array_agg(url) as urls
                    FROM categories c
                    LEFT JOIN images i ON c.page_title = ANY(i.cl_to)
                    LEFT JOIN usages u ON i.img_name = u.gil_to
                    INNER JOIN recommendations r ON i.img_name = r.img_name
                    WHERE r.hidden = FALSE AND
                    (u.is_alive = FALSE
                    OR u.is_alive IS NULL)`;

    let parameters = [];

    if (req.query.cat !== undefined) {
        query += ` AND i.cl_to && ARRAY( 
                    WITH RECURSIVE subcategories AS (
                    SELECT page_title, cl_to
                    FROM categories
                    WHERE page_title = $1
                    UNION
                    SELECT c.page_title, c.cl_to
                    FROM categories c
                    INNER JOIN subcategories s ON s.page_title = ANY(c.cl_to))
                    SELECT DISTINCT page_title
                    FROM subcategories)`;
        parameters.push(req.query.cat);
    }

    query += ` GROUP BY r.img_name, last_update
                ORDER BY RANDOM()`;

    let limit = 5;
    if (req.query.limit !== undefined) {
        limit = parseInt(req.query.limit);
    }

    query += " LIMIT " + limit;

    db.query(query, parameters, (err, dbres) => {
        if (!err) {
            let result = [];

            dbres.rows.forEach(function (row) {
                result.push(row);
            });

            res.json(result);
        } else {
            next(new Error(err));
        }
    });
}

var recommenderByFile = function (req, res, next, db) {
    let query = `SELECT title, url
                FROM recommendations
                WHERE img_name = $1
                ORDER BY score DESC
                LIMIT 10`;

    db.query(query, [req.params.file], (err, dbres) => {
        if (!err) {
            let result = [];

            dbres.rows.forEach(function (row) {
                result.push(row);
            });

            res.json(result);
        } else {
            next(new Error(err));
        }
    });
}

var hideRecommenderByFile = function (req, res, next, db) {
    let query = `UPDATE recommendations
                SET hidden = TRUE
                WHERE img_name = $1`;

    db.query(query, [req.params.file], (err, dbres) => {
        if (!err) {
            res.sendStatus(200);
        } else {
            next(new Error(err));
        }
    });
}

exports.glams = glams;
exports.getAdminGlam = getAdminGlam;
exports.createGlam = createGlam;
exports.updateGlam = updateGlam;
exports.getAnnotations = getAnnotations;
exports.getAnnotation = getAnnotation;
exports.modifyAnnotation = modifyAnnotation;
exports.createAnnotation = createAnnotation;
exports.deleteAnnotation = deleteAnnotation;
exports.getGlam = getGlam;
exports.categoryGraph = categoryGraph;
exports.categoryGraphDataset = categoryGraphDataset;
exports.categoryFiles = categoryFiles;
exports.uploadDate = uploadDate;
exports.uploadDateDataset = uploadDateDataset;
exports.uploadDateAll = uploadDateAll;
exports.usage = usage;
exports.usageDataset = usageDataset;
exports.usageFile = usageFile;
exports.usageStats = usageStats;
exports.usageTop = usageTop;
exports.views = views;
exports.viewsDataset = viewsDataset;
exports.viewsByFile = viewsByFile;
exports.viewsSidebar = viewsSidebar;
exports.viewsStats = viewsStats;
exports.fileDetails = fileDetails;
exports.search = search;
exports.recommender = recommender;
exports.recommenderByFile = recommenderByFile;
exports.hideRecommenderByFile = hideRecommenderByFile;