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

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

var uploadDate = function(req, res, id, start, end, db) {
    db.collection('file', function(err, collection) {
        if (!err) {
            collection.aggregate([{"$group" : {
                _id: {
                    "user": "$img_user_text",
                    "year": {"$year":"$img_timestamp"},
                    "month": {"$month":"$img_timestamp"},
                },
                count:{$sum:1}
              }},
              { $sort: {
                      '_id.user': 1,
                      '_id.year': 1,
                      '_id.month': 1
              }}
            ]).toArray(function(err, docs) {
                var o = {};
                o["timestamp"] = "2017/01/16" //XXX use a real one
                o["users"] = [];
                for (var i = 0; i < docs.length; i++) {
                  var found = 0;
                  for (var j = 0; j < o["users"].length; j++) {
                    if (o["users"][j].user === docs[i]._id.user) {
                      var currentDate = docs[i]._id.year.toString() + "/" + pad(docs[i]._id.month,2).toString();
                      if ((start === undefined || start <= currentDate) && (end === undefined || end >= currentDate)) {
                        o["users"][j].files.push({date: currentDate, count: docs[i].count});
                        found = 1
                        break;
                      }
                    }
                  }
                  if (found === 0) { //New user!
                    var currentDate = docs[i]._id.year.toString() + "/" + pad(docs[i]._id.month,2).toString();
                    if ((start === undefined || start <= currentDate) && (end === undefined || end >= currentDate)) {
                      o["users"].push({user: docs[i]._id.user, files: [{date: currentDate, count: docs[i].count}]})
                    }
                  }
                }

                //THIS IS FOR MAKE EACH COUNT THE SUM OF ITS PRECS
                /*for (var i = 0; i < o["users"].length; i++) {
                  var sum = 0;
                  for (var j = 0; j < o["users"][i]["files"].length; j++) {
                    sum += o["users"][i]["files"][j].count;
                    o["users"][i]["files"][j].count = sum;
                  }
                }*/
                res.send(o);
            });
        } else {
            console.log(err)
        }
    });
}

exports.categoryGraph = categoryGraph;
exports.uploadDate = uploadDate;
