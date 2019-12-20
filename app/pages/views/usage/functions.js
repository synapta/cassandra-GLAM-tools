const FIRST_CALL_LIMIT = 50;
const glam = window.location.href.toString().split('/')[3];

var TOTAL_IMAGES;
var IMAGES_RENDERED = 0;
var RENDERING = false;

var ACTIVE_ITEM_ID;

function getUrl(limit) {
    let l = Number.isInteger(limit) ? "?limit=" + limit : "";
    const db = window.location.href.toString().split('/')[3];
    const subcat = window.location.href.toString().split('/')[5];
    let query = subcat ? (l ? l+ "&cat="+subcat : "?cat="+subcat) : l;
    return "/api/" + db + "/usage" + query;
}

function getSubcategoryTotal() {
    const urlSplit = window.location.href.toString().split('/');
    if (urlSplit[5]){
	let url = "/api/"+urlSplit[3]+"/category?cat"+urlSplit[5];
	$.getJSON(url).then(res=>{
	    let tot = res.nodes[0].files;
	    $('#totalMediaNum').text(formatter(tot));
	});
    }
}

function getUrl(limit, sort) {
    let l = Number.isInteger(limit) ? "?limit=" + limit : "";
    let s;
    if (sort === 'usage' || sort === 'projects' || sort === 'name') {
	s = '&sort=' + sort;
    } else {
	s = "";
    }
    let db = window.location.href.toString().split('/')[3];
    const subcat = window.location.href.toString().split('/')[5];
    let query = subcat ? (l+s ? (l + s + "&cat="+subcat) : "?cat="+subcat) : l+s;
    query = query ? query+ "&page=0" : "?page=0";
    return "/api/" + db + "/usage" + query ;
}

function getUrlPaginated(page, sort) {
    let s;
    if (sort === 'usage' || sort === 'projects' || sort === 'name') {
	s = '&sort=' + sort;
    } else {
	s = "";
    }
    if (!Number.isInteger(page)) {
	console.error("Invalid page number", page);
    } else {
	const db = window.location.href.toString().split('/')[3];
	const subcat = window.location.href.toString().split('/')[5];
	let subcatQ = subcat ? "&cat="+subcat : "";
	return "/api/" + db + "/usage?page=" + page + s + subcatQ;
    }
}

function getUrlDataset() {
    const db = window.location.href.toString().split('/')[3];
    const subcat = window.location.href.toString().split('/')[5];
    let subcatQ = subcat ? "?cat="+subcat : "";
    return "/api/" + db + "/usage/dataset"+subcatQ;
}

function getUrlAll() {
    const db = window.location.href.toString().split('/')[3];
    const subcat = window.location.href.toString().split('/')[5];
    let subcatQ = subcat ? "?cat="+subcat : "";
    return "/api/" + db + "/usage/stats"+subcatQ;
}

function getUrlTop20() {
    const db = window.location.href.toString().split('/')[3];
    const subcat = window.location.href.toString().split('/')[5];
    let subcatQ = subcat ? "?cat="+subcat : "";
    return "/api/" + db + "/usage/top"+subcatQ;
}

function sidebar(type) {
    $.getJSON(getUrlAll(), function(stats) {
	// is rendering
	RENDERING = true;
	// save total
	TOTAL_IMAGES = stats.totalImagesUsed;
	// get tempalte
	$.get("/views/usage/tpl/usage.tpl", function(tpl) {
	    // get data
	    $.getJSON(getUrl(FIRST_CALL_LIMIT, type), function(data) {
		// scroll up
		$('#right_sidebar_list').scrollTop(0);
		// render first part
		renderImageListItems(tpl, data);
		//  set scroll handlers
		if (FIRST_CALL_LIMIT < TOTAL_IMAGES) {
		    $('#right_sidebar_list').off("scroll").scroll(loadMoreOnScroll.bind($('#right_sidebar_list'), type));
		}
		// Manage click
		highlightOnClick();
	    });
	});
    });
}

function renderImageListItems(tpl, data, append) {
    // if append not provided, set to false
    append = append || false;
    // loop through data and display items
    data.forEach(function(file) {
	// Format name and id
	file.url = '/'+glam+'/file/'+file.image;
	file.image_name = file.image.replace(/_/g," ");
	file.image_id = cleanImageName(file.image);
	// Format wiki pages list
	let currentWiki = null;
	file.wiki_array = [];
	file.wikis = [];
	// sort alphabetically
	file.pages = file.pages.sort(function(a,b) {
	    if (a.wiki < b.wiki) return -1;
	    if (a.wiki > b.wiki) return 1;
	    return 0;
	});
	// loop through all pages
	var wiki_obj = {};
	file.pages.forEach(function(page) {
	    // format object
	    let link_obj = {};
	    // check if not already added
	    if (currentWiki !== page.wiki) {
		// reset temp object
		wiki_obj = {}
		wiki_obj.wiki_links = [];
		// update current wiki
		currentWiki = page.wiki;
		// page name
		wiki_obj.wiki_name = currentWiki;
		// links
		link_obj.wiki_link =  `https://${currentWiki.replace("wiki","")}.wikipedia.org/w/index.php?title=${page.title}`;
		link_obj.wiki_page = page.title.replace(/_/g, " ");
		// push
		wiki_obj.wiki_links.push(link_obj);
		file.wikis.push(wiki_obj);
		// save wiki list in an array (for highlighting bars in chart)
		file.wiki_array.push(currentWiki);
	    } else {
		// add link to current wiki object
		link_obj.wiki_link =  `https://${currentWiki.replace("wiki","")}.wikipedia.org/w/index.php?title=${page.title}`;
		link_obj.wiki_page = page.title.replace(/_/g, " ");
		// push current wiki object
		wiki_obj.wiki_links.push(link_obj);
	    }
	});
	file.wiki_array = JSON.stringify(file.wiki_array);
    });
    // increment number of items rendered
    IMAGES_RENDERED += data.length;
    // compile template
    var obj = {};
    obj.files = data;
    var template = Handlebars.compile(tpl);
    // append existing content or replace html
    append ? $('#right_sidebar_list').append(template(obj)) : $('#right_sidebar_list').html(template(obj));
    // set tatus to finished rendering
    RENDERING = false;
    // Prevent defaul when click on "view details"
    $('.view-details-link').off('click').on('click', function(e) {
	e.stopPropagation();
    });
}


function loadMoreOnScroll(sort_type) {
    // if reached end of div
    if (($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) && !RENDERING) {
	// if there are more elements to load
	if (IMAGES_RENDERED < TOTAL_IMAGES) {
	    // calc new page number
	    let page = getPageFromElementIdx(IMAGES_RENDERED + 1, 10);
	    //get template
	    $.get("/views/usage/tpl/usage.tpl", function(tpl) {
		// get data
		$.getJSON(getUrlPaginated(page, sort_type), function(data) {
		    RENDERING = true;
		    // last argument to true calls append() instead of html()
		    renderImageListItems(tpl, data, true)
		    // manage click
		    highlightOnClick();
		});
	    });
	} else {
	    // show "no more elements"
	    $('#right_sidebar_list').append('<div class="mt-4 text-center">No more elements to load</div>');
	    // remove handler
	    $('#right_sidebar_list').off('scroll', loadMoreOnScroll);
	}
    }
}


function highlightOnClick(string) {
    
    if (ACTIVE_ITEM_ID !== undefined) {
	$('#' + ACTIVE_ITEM_ID).addClass('list_item_active');
    }
    
    // remove handler and set it on update elements
    $(".list_item").off("click").on("click", function() {
	if ($(this).hasClass('list_item_active')) {
	    $(".list_item").removeClass("list_item_active");
	    ACTIVE_ITEM_ID = undefined;
	    // from horiz-bar-chart.js
	    turnOffUsageBars();
	} else {
	    $(".list_item").removeClass("list_item_active");
	    $(this).addClass("list_item_active")
	    ACTIVE_ITEM_ID = $(this).attr("id");
	    // from horiz-bar-chart.js
	    highlightUsageBars($(this).data("wikilist"));
	}
    });
}

function sorting_sidebar() {
    $("#by_num").on("click", function(){
	if ($("#by_num").hasClass("active_order") ) {
	    //console.log("già selezionato")
	} else {
	    $("#by_name").removeClass("active_order");
	    $("#by_num").addClass("active_order");
	    $("#by_proj").removeClass("active_order");
	    sidebar("usage");
	    $("#by_num").css("cursor","default");
	    $("#by_name").css("cursor","pointer");
	    $("#by_proj").css("cursor","pointer");
	}
    })
    
    $("#by_proj").on("click", function(){
	if ($("#by_proj").hasClass("active_order") ) {
	    //console.log("già selezionato")
	} else {
	    $("#by_name").removeClass("active_order");
	    $("#by_num").removeClass("active_order");
	    $("#by_proj").addClass("active_order");
	    sidebar("projects");
	    $("#by_name").css("cursor","pointer");
	    $("#by_num").css("cursor","pointer");
	    $("#by_proj").css("cursor","default");
	}
    })
    
    $("#by_name").on("click", function(){
	if ($("#by_name").hasClass("active_order") ) {
	    //console.log("già selezionato")
	} else {
	    $("#by_name").addClass("active_order");
	    $("#by_num").removeClass("active_order");
	    $("#by_proj").removeClass("active_order");
	    sidebar("name");
	    $("#by_name").css("cursor","default");
	    $("#by_num").css("cursor","pointer");
	    $("#by_proj").css("cursor","pointer");
	}
    })
}

function download(){
    $('<a href="' + getUrlDataset() + '" download="' + "usage.csv" + '">Download dataset</a>').appendTo('#download_dataset');
}

function how_to_read() {
    button = $("#how_to_read_button");
    box = $(".how_to_read");
    
    $("#how_to_read_button").click(function(){
	box.toggleClass("show");
    });
};

function drawUsageDataViz() {
    d3.json(getUrlAll(), function(error, data) {
        console.log(data)
	// Manage error
	if (error) window.location.href('/500');
	// Draw stats data
	drawStats(data);
	// From utils.js
	setCategory();
	getSubcategoryTotal();
	// Draw bar chart
	horizBarChartDraw("usage_horiz_bars", getUrlTop20(), data);
    });
}

function drawStats(stats_data) {
    $("#usage_stat #distinct-media").append("<p>Distinct media used</p> <div><b>" + formatter(stats_data.totalImagesUsed) + "</b> / <span id='totalMediaNum'></span></div>");
    $("#usage_stat #total-projects").append("<p>Total projects involved</p> <b>" + formatter(stats_data.totalProjects) + "</b>");
    $("#usage_stat #total-pages").append("<p>Total pages enhanced</p> <b>" + formatter(stats_data.totalPages) + "</b>");
}

$(function() {
    setCategory();
    how_to_read();
    sidebar("by_num");
    download();
    switch_page();
    sorting_sidebar();
    drawUsageDataViz();
});
