const FIRST_CALL_LIMIT = 100;
let TOTAL_IMAGES;
let IMAGES_RENDERED = 0;
let RENDERING = false;
let ACTIVE_ITEM_ID;

function getUrlAll() {
    const db = window.location.href.toString().split('/')[3];
    const groupby = $('#groupby-select').val();
    const subcat = window.location.href.toString().split('/')[5];
    const subcatQ = subcat ? "&cat="+subcat : "";
    return "/api/"+db+"/views?groupby=" + groupby + subcatQ;
}

function getUrlDataset() {
    const groupby = $("#groupby-select").val();
    const db = window.location.href.toString().split('/')[3];
    // console.log(groupby);
    return "/api/" + db + "/views/dataset/" + groupby;
}

function getUrlStats() {
    var db = window.location.href.toString().split('/')[3];
    const subcat = window.location.href.toString().split('/')[5];
    const subcatQ = subcat ? "?cat="+subcat : "";
    return "/api/" + db + "/views/stats"+subcatQ;
}

// function getUrlFiles(){
// 	var db=window.location.href.toString().split('/')[3];
// 	return "/api/"+db+"/views/files";
// }

// function getUrlSidebar() {
// 	var db=window.location.href.toString().split('/')[3];
// 	return "/api/" + db + "/views/sidebar";
// }

function getUrlSidebarLimit(limit) {
    let l = Number.isInteger(limit) ? "?limit=" + limit : "";
    const db = window.location.href.toString().split('/')[3];
    const subcat = window.location.href.toString().split('/')[5];
    let query = subcat ? (l ? l+ "&cat="+subcat : "?cat="+subcat) : l;
    return "/api/" + db + "/views/sidebar" + query;
}

function getUrlSidebar(limit, sort) {
    let l = Number.isInteger(limit) ? "?limit=" + limit : "";
    let s;
    if (sort === 'views' || sort === 'median' || sort === 'name') {
	s = '&sort=' + sort;
    } else {
	s = "";
    }
    const db = window.location.href.toString().split('/')[3];
    const subcat = window.location.href.toString().split('/')[5];
    let query = subcat ? (l+s ? (l + s + "&cat="+subcat) : "?cat="+subcat) : l+s;
    query = query ? query+ "&page=0" : "?page=0";
    return "/api/" + db + "/views/sidebar" + query;
}

function getUrlSidebarPaginated(page, sort) {
    let s;
    if (sort === 'views' || sort === 'median' || sort === 'name') {
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
	return "/api/" + db + "/views/sidebar?page=" + page + s + subcatQ;
    }
}

function sidebar(type) {
    $.getJSON(getUrlStats(), function(stats) {
	// is rendering
	RENDERING = true;
	// save total
	TOTAL_IMAGES = stats.total;
	// get tempalte
	$.get("/views/page-views/tpl/views.tpl", function(tpl) {
	    $.getJSON(getUrlSidebar(FIRST_CALL_LIMIT, type), function(data) {
		// scroll up
		$('#right_sidebar_list').scrollTop(0);
		// render first part
		renderSidebarItems(tpl, data);
		//  set scroll handlers
		if (FIRST_CALL_LIMIT < TOTAL_IMAGES) {
		    $('#right_sidebar_list').off('scroll').scroll(loadMoreOnScroll.bind($('#right_sidebar_list'), type));
		}
		
		highlightOnClick();
	    });
	});
    });
}

function renderSidebarItems(tpl, data, append) {
    // if append not provided, set to false
    append = append || false;
    // process data
    data.forEach(function(d) {
	d.img_name_text = d.img_name.replace(/_/g," ");
	d.img_name_id = d.img_name.replace(".jpg", "");
	d.tot = nFormatter(+d.tot);
	d.av = nFormatter(+d.av);
	d.median = nFormatter(+d.median);
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
	    let page = getPageFromElementIdx(IMAGES_RENDERED + 1, 100);
	    //get template
	    $.get("/views/page-views/tpl/views.tpl", function(tpl) {
		// get data
		$.getJSON(getUrlSidebarPaginated(page, sort_type), function(data) {
		    RENDERING = true;
		    // last argument to true calls append() instead of html()
		    renderSidebarItems(tpl, data, true);
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

function sorting_sidebar() {
    $("#by_num").on("click", function(){
	if ($("#by_num").hasClass("active_order") ) {
	    //console.log("già selezionato")
	} else {
	    $("#by_name").removeClass("active_order");
	    $("#by_num").addClass("active_order");
	    $("#by_median").removeClass("active_order");
	    sidebar("views");
	    $("#by_num").css("cursor","default");
	    $("#by_name").css("cursor","pointer");
	    $("#by_median").css("cursor","pointer");
	}
    });
    
    $("#by_median").on("click", function(){
	if ($("#by_median").hasClass("active_order") ) {
	    //console.log("già selezionato")
	} else {
	    $("#by_name").removeClass("active_order");
	    $("#by_num").removeClass("active_order");
	    $("#by_median").addClass("active_order");
	    sidebar("median");
	    $("#by_name").css("cursor","pointer");
	    $("#by_num").css("cursor","pointer");
	    $("#by_median").css("cursor","default");
	}
    });
    
    $("#by_name").on("click", function(){
	if ($("#by_name").hasClass("active_order") ) {
	    //console.log("già selezionato")
	} else {
	    $("#by_name").addClass("active_order");
	    $("#by_num").removeClass("active_order");
	    $("#by_median").removeClass("active_order");
	    sidebar("name");
	    $("#by_name").css("cursor","default");
	    $("#by_num").css("cursor","pointer");
	    $("#by_median").css("cursor","pointer");
	}
    });
}

function download(){
    // remove old link
    $("#download_dataset a").remove();
    // recreate download link based on timespan
    $('<a href="' + getUrlDataset() + '" download="' + "views.csv" + '">Download dataset</a>').appendTo('#download_dataset');
}

function how_to_read(){
    button = $("#how_to_read_button");
    box = $(".how_to_read");
    
    $("#how_to_read_button").click(function(){
	box.toggleClass("show");
	// console.log("click")
    });
}

function highlightOnClick() {
    
    if (ACTIVE_ITEM_ID !== undefined) {
	$('#' + ACTIVE_ITEM_ID).closest('.list_item').addClass('list_item_active');
    }
    
    // remove handler and set it on update elements
    $(".list_item").off("click").on("click", function() {
	var element = $(this).find('.id.item').attr("id");
	
	if ($(this).hasClass('list_item_active')) {
	    $(".list_item").removeClass("list_item_active");
	    ACTIVE_ITEM_ID = undefined;
	    hideFileLine();
	} else {
	    $(".list_item").removeClass("list_item_active");
	    $(this).addClass("list_item_active");
	    ACTIVE_ITEM_ID = element;
	    showFileLine($(this).data('imagename'));
	}
	
    });
}

function statDraw() {
    d3.json(getUrlAll(), function (error, data) {
	if (error) { window.location.href('/500'); }
	$("#usage_stat").append("<br><br>");
	$("#usage_stat").append("Distinct media used: <b>" + data.totalImagesUsed + "</b>");
	$("#usage_stat").append("<br><br>");
	$("#usage_stat").append("Total projects touched: <b>" + data.totalProjects + "</b>");
	$("#usage_stat").append("<br><br>");
	$("#usage_stat").append("Total pages enhanced: <b>" + data.totalPages + "</b>");
    });
}

$(document).ready(function(){
    setCategory();
    how_to_read();
    sidebar("views");
    download();
    switch_page();
    sorting_sidebar();
    lineChartDraw("main_views_container", getUrlAll());
    $('#groupby-select').change(function() {
	$("#right_sidebar_list .list_item_active").trigger("click");
	// $("#main_views_container").empty();
	lineChartDraw("main_views_container", getUrlAll());
	download();
    });
    statDraw();
});
