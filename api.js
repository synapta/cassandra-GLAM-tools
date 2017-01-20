var categoryGraph = function(req, res, id, db) {
    db.collection('category', function(err, collection) {
        if (!err) {
            collection.find({}, {page_title:1, cat_pages:1, level:1, _id:0}).toArray(function(err, nodes) {
                collection.find({}, {parent:1, page_title:1, _id:0}).toArray(function(err, edges) {
                    nodes = JSON.parse(JSON.stringify(nodes).split('"page_title":').join('"id":'));
                    nodes = JSON.parse(JSON.stringify(nodes).split('"cat_pages":').join('"files":'));
                    nodes = JSON.parse(JSON.stringify(nodes).split('"level":').join('"group":'));
                    edges = JSON.parse(JSON.stringify(edges).split('"parent":').join('"source":'));
                    edges = JSON.parse(JSON.stringify(edges).split('"page_title":').join('"target":'));
                    var o = {};
                    o["nodes"] = nodes;
                    for (var i = 0; i < edges.length; i++) {
                        if (edges[i].source === null) {
                            edges.splice(i, 1);
                            break;
                        }
                    }
                    o["edges"] = edges;
                    res.send(o);
                });
            });
        } else {
            console.log(err)
        }
    });
}

var uploadDate = function(req, res, id, db) {
    db.collection('file', function(err, collection) {
        if (!err) {
            collection.aggregate([ {$group: { _id :
                {
                    year:{$year:"$img_timestamp"},
                    month:{$month:"$img_timestamp"},
                    day:{$dayOfMonth:"$img_timestamp"}
                },
                count:{$sum: 1 }
            }},
            { $sort: {
                    '_id.year': 1,
                    '_id.month': 1,
                    '_id.day': 1
            }}]).toArray(function(err, docs) {
                res.send(docs);
            });
        } else {
            console.log(err)
        }
    });
}

exports.categoryGraph = categoryGraph;
exports.uploadDate = uploadDate;
