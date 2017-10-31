//INCLUDES
var fs = require('fs');
var utf8 = require('utf8');
var MariaClient = require('mariasql');
var config = require('./config.js');
//CONSTANTS
const CONST_ITEMS_PER_QUERY = 25;
//GLOBALS
var configDataObj;
var dbAccess;
var Categories;
var wikiCaller;
var catQueue;
var catHead=0;
var catFreeTail=0;
//FUNCTIONS
var Finalize=function()
{
    wikiCaller.end();
    console.log("\nProcess fully completed!")
    return 0;
}
var SearchCatQueue=function(page)
{
    var i=0;
    while(i<catHead)
    {
        if(catQueue[i].page_title==page)
            break;
        i++;
    }
    if(i==catHead)
        i=-1;
    return i;
}
var WikiOpen = function () 
{
    catQueue=[];
    catFreeTail=1;
    catHead=0;
    catQueue[0] = new Object();
    catQueue[0].page_title=config.STARTING_CAT;
    catQueue[0].level=0;
    catQueue[0].cat_subcats=0;
    catQueue[0].cat_files=0;
    catQueue[0].father="ROOT";
    console.log("===========================================");
    console.log("Loading categories...");   
    wikiCaller = config.connectionToWMF;
    let temp_query="select cat_subcats, cat_files from category where cat_title='"+config.STARTING_CAT+"'";
    wikiCaller.query(temp_query, function (err, rows) 
    {
        catQueue[0].cat_subcats=rows[0].cat_subcats;
        catQueue[0].cat_files=rows[0].cat_files;
        GetLevelChilds();
    });
}
var GetLevelChilds = function () 
{
    if (catHead>=catFreeTail)//all visited
    {
        afterCategories();
        return;
    }
    console.log("At " + catHead + " of " + catFreeTail);
    var RQ="";
    var originalHead=catHead;
    while(catHead<catFreeTail&&catHead<(originalHead+CONST_ITEMS_PER_QUERY))
    {
        if(catHead>originalHead)
            RQ+=",";
        RQ+="'"+catQueue[catHead].page_title.replace(/'/g,"''")+"'"
        catHead++;
    }

    var query = BuildCategoryQuery(RQ);
    wikiCaller.query(query, function (err, rows) 
    {
        if (err)
            throw err;
        for (var k = 0; k < rows.length; k++) 
        {
            var newPage=utf8.decode(rows[k].page_title);
            var father=utf8.decode(rows[k].cl_to);
            if(SearchCatQueue(newPage)==-1)//prevent loops
            {
                var fatherIndex=SearchCatQueue(father);
                catQueue[catFreeTail] = new Object();
                catQueue[catFreeTail].page_title=newPage;
                catQueue[catFreeTail].cat_subcats=rows[k].cat_subcats;
                catQueue[catFreeTail].cat_files=rows[k].cat_files;
                catQueue[catFreeTail].level=catQueue[fatherIndex].level+1;
                catQueue[catFreeTail].father=father;
                
                catFreeTail++;
            }
        }
        GetLevelChilds();
    });
}
var afterCategories=function()
{
    console.log(catQueue);
    //Load in postgres the data
    let storage_query="delete categories; insert into categories(page_title,cat_subcats,cat_files,cl_to,cat_level) values ";
    let i=0;
    while(i<catFreeTail)
    {
        let temp="";
        let Cat=catQueue[i];
        if(i>0)
            temp=",";
        temp+="('"+Cat.page_title.replace(/'/g,"''")+"',"+Cat.cat_subcats+","+Cat.cat_files+",'"+
            Cat.father.replace(/'/g,"''")+"',"+Cat.level+")";
        storage_query+=temp;
        i++;
    }
    config.storage.connect();
    console.log(storage_query);
    config.storage.query(storage_query,function(err,res){
        config.storage.end();
        Finalize();
    });   
}
var BuildCategoryQuery = function (RQ) 
{
    return `SELECT page_title, cl_to, cat_subcats, cat_files
    FROM categorylinks, page, category
    WHERE cl_to IN (${RQ})
    AND page_id = cl_from
    AND page_namespace = 14
    AND page_title = cat_title`;
}


//ENTRY POINT
console.log("Application launched...");
WikiOpen();
