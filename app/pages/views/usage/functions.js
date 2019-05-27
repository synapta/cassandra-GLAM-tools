const FIRST_CALL_LIMIT = 300;

var TOTAL_IMAGES;
var IMAGES_RENDERED = 0;
var RENDERING = false;

var ACTIVE_ITEM_ID;

function getUrl(limit) {
	let l = Number.isInteger(limit) ? "?limit=" + limit : "";
	var db = window.location.href.toString().split('/')[3];
	return "/api/" + db + "/usage" + l;
}

function getUrl(limit, sort) {
	let l = Number.isInteger(limit) ? "?limit=" + limit : "";
	let s;
	if (sort === 'usage' || sort === 'projects' || sort === 'name') {
		s = '&sort=' + sort;
	} else {
		s = "";
	}
	var db = window.location.href.toString().split('/')[3];
	return "/api/" + db + "/usage" + l + s + "&page=0";
}

function getUrlPaginated(page) {
	if (!Number.isInteger(page)) {
		console.error("Invalid page number", page);
	} else {
		var db = window.location.href.toString().split('/')[3];
		return "/api/" + db + "/usage?page=" + page;
	}
}

function getUrlAll() {
	var db = window.location.href.toString().split('/')[3];
	return "/api/" + db + "/usage/stats";
}

function getUrlTop20() {
	var db = window.location.href.toString().split('/')[3];
	return "/api/" + db + "/usage/top";
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
				// render first part
				renderImageListItems(tpl, data);
				//  set scroll handlers
				if (FIRST_CALL_LIMIT < TOTAL_IMAGES) {
					$('#right_sidebar_list').scroll(loadMoreOnScroll);
				}
				// Manage click
				highlightOnClick();
			});
		});
	});
}

function getPageFromElementIdx(element_idx) {
	// calc in which page is an element with a given index
	return Math.floor((element_idx - 1) / 10);
}

function renderImageListItems(tpl, data, append) {
	// if append not provided, set to false
	append = append || false;
	// loop through data and display items
	data.forEach(function(file) {
		// Format name and id
		file.image_name = file.image.replace(/_/g," ");
		file.image_id = cleanImageName(file.image);
		// Format wiki pages list
		file.wikis= [];
		let currentWiki = null;
		// loop through all pages
		file.pages.forEach(function(page) {
			// check if not already added
			if (currentWiki !== page.wiki) {
				// format object
				let wiki_obj = {};
				currentWiki = page.wiki;
				wiki_obj.wiki_name = currentWiki;
				wiki_obj.wiki_link =  `https://${currentWiki.replace("wiki","")}.wikipedia.org/w/index.php?title=${page.title}`;
				wiki_obj.wiki_page = page.title.replace(/_/g, " ");
				// push
				file.wikis.push(wiki_obj);
			}
		});
	});
	// increment number of items rendered
	IMAGES_RENDERED += data.length;
	// complile template
	var obj = {};
	obj.files = data;
	var template = Handlebars.compile(tpl);
	// append existing content or replace html
	append ? $('#right_sidebar_list').append(template(obj)) : $('#right_sidebar_list').html(template(obj));
	// set tatus to finished rendering
	RENDERING = false;
}


function loadMoreOnScroll() {
	// if reached end of div
	if (($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) && !RENDERING) {
		// if there are more elements to load
		if (IMAGES_RENDERED < TOTAL_IMAGES) {
			// calc new page number
			let page = getPageFromElementIdx(IMAGES_RENDERED + 1);
			//get template
			$.get("/views/usage/tpl/usage.tpl", function(tpl) {
				// get data
				$.getJSON(getUrlPaginated(page), function(data) {
					RENDERING = true;
					// last argument to true calls append() instead of html()
					renderImageListItems(tpl, data, true)
					// manage click
					highlightOnClick('new elements');
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
		} else {
			$(".list_item").removeClass("list_item_active");
			$(this).addClass("list_item_active")
			ACTIVE_ITEM_ID = $(this).attr("id");
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

function cleanImageName(name) {
	// clean special characters in order to use image name as element ID
	return name.replace(/jpg/i, "").replace(/png/i, "").replace(/[{()}]/g, "").replace(/\./g,"").replace(/\,/g,"").replace(/&/g,"").replace(/'/g,"").replace(/"/g,"");
}

function download(){
	$('<a href="' + getUrl() + '" download="' + "usage.json" + '">Download dataset</a>').appendTo('#download_dataset');
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
		// Manage error
		if (error) window.location.href('/500');
		// Draw stats data
		drawStats(data);
		// From utils.js
		setCategory();
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
