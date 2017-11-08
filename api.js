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
            console.log(err);
            res.sendStatus(400);
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
    query='select count(*) as img_count, img_user_text, to_char(img_timestamp, \'YYYY/MM\') as img_time from images';
    if(start!=null)//start and end are defined, convert them to timestamp and append
    {
        splitted=start.split('/');
        start_timestamp="'"+splitted[0]+"-"+splitted[1]+"-1 00:00:00'";
        query+=" where img_timestamp>="+start_timestamp;
    }
    if(end!=null)
    {
        splitted=end.split('/');
        end_timestamp="'"+splitted[0]+"-"+splitted[1]+"-1 00:00:00'";
        if(start==null)
            query+=" where ";
        else
            query+=" and ";
        query+="img_timestamp<="+end_timestamp;
    }
    query+=" group by img_user_text, img_time order by img_user_text";
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
            console.log(err);
            res.sendStatus(400);
        }

    })
}
var usage = function(req, res, id, db) 
{
    db.query('select gil_to,gil_wiki,gil_page_title from usages where is_alive=true order by gil_to', (err, dbres) => {
        if(!err)
        {
            result=[];
            dbindex=0;
            resindex=0;
            while(dbindex<dbres.rows.length)
            {
                result[resindex]=new Object();
                result[resindex].image=dbres.rows[dbindex].gil_to;
                page=dbres.rows[dbindex].gil_to;
                result[resindex].pages=[];
                j=0;
                while(dbindex<dbres.rows.length&&page==dbres.rows[dbindex].gil_to)
                {
                    result[resindex].pages[j]=new Object();
                    result[resindex].pages[j].wiki=dbres.rows[dbindex].gil_wiki;
                    result[resindex].pages[j].title=dbres.rows[dbindex].gil_page_title;
                    j++;
                    dbindex++;
                }
                resindex++;

            }
            res.json(result);
        }
        else
        {
            console.log(err);
            res.sendStatus(400);
        }
    });
}
var viewsAll = function(req, res, id, db) 
{
    db.query('select sum(accesses) from visualizations', (err, dbres) => {
        if(!err)
        {
            res.json(dbres.rows[0]);
        }
        else
        {
            console.log(err);
            res.sendStatus(400);
        }
    });
}
Date.prototype.addHours = function(h) {    
    this.setTime(this.getTime() + (h*60*60*1000)); 
    return this;   
 }
var viewsByDate = function(req, res, id, db) 
{
    db.query('select sum(accesses) as sum,access_date from visualizations group by access_date', (err, dbres) => {
        if(!err)
        {
            result=[];
            i=0;
            while(i<dbres.rows.length)
            {
                result[i]=new Object;
                result[i].date=dbres.rows[i].access_date.addHours(1).toISOString().substring(0,10);//necessario aggiungere un'ora perchè lo vede con tempo +0, e quindi sottrae un ora (andando quindi nel giorno prima) alla data +1 di postgres
                result[i].views=dbres.rows[i].sum;
                i++;
            }
            res.json(result);
        }
        else
        {
            console.log(err);
            res.sendStatus(400);
        }
    });
}

exports.viewsByDate = viewsByDate;
exports.viewsAll = viewsAll;
exports.categoryGraph = categoryGraph;
exports.uploadDate = uploadDate;
exports.usage = usage;
