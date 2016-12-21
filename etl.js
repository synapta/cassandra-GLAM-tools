var MariaClient = require('mariasql');
var MongoClient = require('mongodb').MongoClient;
var config = require('./config.js');

//XXX if loop, can lasts forever
var findCat = function (current, parent) {
    console.log("[ADD] category " + current +  " to mongo");
    categories.update(
        { page_title: current },
        { $set: { page_title: current, parent: parent } },
        { upsert: true },
        function(err, result) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            console.log("[DONE] category " + current + " in mongo");
            //console.log(result)
    })


    var findCatChildren = "SELECT page_title \
                           FROM categorylinks, page \
                           WHERE cl_to = '" + current + "' \
                           AND page_id = cl_from \
                           AND page_namespace = 14"

    console.log("[ASK] category query");
    config.connectionToWMF.query(findCatChildren, function(err, rows) {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        console.log("[GOT] category results");
        //console.dir(rows);

        for (var r = 0; r < rows.length; r++) {
            findCat(rows[r].page_title, current);
        }
    });
}

console.log("Opening connection to MongoDB...")
MongoClient.connect(config.mongoURL, function(err, db) {
    console.log("Connected correctly to the database!");
    categories = db.collection('category');
    files = db.collection('file');

    //findCat(config.STARTING_CAT);
    findCat("San_Vitale_(Ravenna)", null);
});
