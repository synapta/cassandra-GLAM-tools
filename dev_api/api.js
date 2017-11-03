var util = require('util');
function arrayMin(arr) {
    var len = arr.length, min = Infinity;
    while (len--) {
      if (arr[len] < min) {
        min = arr[len];
      }
    }
    return min;
};
var categoryGraph = function(req, res, id, db) 
{
    db.query('SELECT page_title,cat_files,cl_to[0:10],cat_level[0:10] from categories', (err, dbres) => {
        if(!err)
        {
            var result=Object();
            result.nodes=[];
            result.edges=[];
            i=0;
            while(i<dbres.rows.length)
            {
                node=Object();
                node.id=dbres.rows[i].page_title;
                node.files=dbres.rows[i].cat_files;
                node.group=arrayMin(dbres.rows[i].cat_level);
                j=0;
                while(j<dbres.rows[i].cl_to.length)
                {
                    edge=Object();
                    edge.target=dbres.rows[i].page_title;
                    edge.source=dbres.rows[i].cl_to[j];
                    result.edges[result.edges.length]=edge;
                    if(edge.source=="ROOT")
                        edge.source=null;
                    j++;
                }
                result.nodes[i]=node;
                
                i++;
            }
            res.json(result);
        }else {
            console.log(err)
        }

    })
    
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

var uploadDate = function(req, res, id, start, end, db)
{
    query='select count(*) as img_count, img_user_text, to_char(img_timestamp, \'YYYY/MM\') as img_time from images group by img_user_text, img_time order by img_user_text';
    console.log(start);
    console.log(end);
    if(start!=null)//start and end are defined, convert them to timestamp and append
    {
        console.log("gatto");
    }
    if(end!=null)
    {
        
    }
    db.query(query, (err, dbres) => {
        if(!err)
        {
            result=new Object();
            result.users=[];
            i=0;
            while(i<dbres.rows.length)
            {
                user=Object();
                user.user=dbres.rows[i].img_user_text;
                user.files=[];
                while(i<dbres.rows.length&&user.user==dbres.rows[i].img_user_text)
                {
                    file=Object();
                    file.date=dbres.rows[i].img_time;
                    file.count=dbres.rows[i].img_count;
                    user.files[user.files.length]=file;
                    i++;
                }
                result.users[result.users.length]=user;                
            }
            res.json(result);
        }else {
            console.log(err)
        }

    })
}

exports.categoryGraph = categoryGraph;
exports.uploadDate = uploadDate;
