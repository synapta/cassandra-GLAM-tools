var categoryNode = function(req, res, id, db) {
    db.collection('category', function(err, collection) {
        if (!err) {
            collection.find({}, {page_title:1, cat_pages:1, _id:0}).toArray(function(err, docs) {
                res.send(docs);
            });
        } else {
            console.log(err)
        }
    });
}

var categoryEdge = function(req, res, id, db) {
    db.collection('category', function(err, collection) {
        if (!err) {
            collection.find({}, {page_title:1, parent:1, _id:0}).toArray(function(err, docs) {
                res.send(docs);
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

exports.categoryNode = categoryNode;
exports.categoryEdge = categoryEdge;
exports.uploadDate = uploadDate;
