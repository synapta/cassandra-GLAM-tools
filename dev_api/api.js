var util = require('util');
var categoryGraph = function(req, res, id, db) 
{
    query={text:'SELECT * from categories',rowMode: 'array'};
    db.query(query, (err, dbres) => {
        var result=Object();
        result.nodes=[];
        i=0;
        while(i<dbres.rows.length)
        {
            node=Object();
            /*node.id=dbres.rows[i].page_title;
            node.files=dbres.rows[i].cat_files;*/
            //console.log("1: "+dbres.rows[i].cat_level[0]);
            //console.log("2: "+dbres.rows[i].cat_level[1]);
            console.log(util.inspect(dbres, {showHidden: true, depth: null}))
            //node.group=dbres.rows[i].cat_level;
            result.nodes[i]=node;
            i++;
        }
        res.json(result);
    })
    
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
