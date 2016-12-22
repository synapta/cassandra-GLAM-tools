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

exports.categoryNode = categoryNode;
exports.categoryEdge = categoryEdge;
