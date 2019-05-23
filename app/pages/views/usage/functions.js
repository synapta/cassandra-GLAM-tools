var ACTIVE_ITEM_ID;

function getUrl(limit) {
	let l = Number.isInteger(limit) ? "?limit=" + limit : "";
	var db = window.location.href.toString().split('/')[3];
	return "/api/" + db + "/usage" + l;
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

function getUrlSidebar() {
	var db = window.location.href.toString().split('/')[3];
	return "/api/" + db + "/usage/sidebar";
}

// function dataviz() {
// 	  d3.json(getUrl(), function(error, data) {
// 				if (error) 	window.location.replace('/500');
//
// 				/*data.users = data.users.sort(function(a,b) {
// 					return b.total - a.total;
// 				});*/
//
// 				console.log('detasdaails data', data);
//
// 				data.forEach(function(file) {
// 					  $("#file_usage_container").append("<h2 style='margin-left:1.5em' id='" + file.image + "_viz'>" + file.image.replace(/_/g, " ") + "</h2>")
// 						let currentWiki = null;
// 						let entry = "";
// 						entry += "<table>";
// 						for (let i = 0; i < file.pages.length; i++) {
// 							  if (currentWiki !== file.pages[i].wiki && currentWiki !== null) {
// 									  entry += "</td></tr>";
// 								}
// 							  if (currentWiki !== file.pages[i].wiki) {
// 									  currentWiki = file.pages[i].wiki;
// 										entry += "<tr>";
// 										entry += "<td>";
// 										entry += "<span style='margin-left:3em;font-size:0.7em;text-decoration:underline'>" + currentWiki + "</span>";
// 										entry += "</td><td style='padding-left:2em'>";
// 								}
// 								//XXX doesn't work with wikidata or wikisource
// 							  entry += "<a href='https://" + currentWiki.replace("wiki","") + ".wikipedia.org/w/index.php?title=" +
// 								  file.pages[i].title +"' style='font-size:0.9em;margin-right:2em'>" + file.pages[i].title.replace(/_/g, " ") + "</a>";
// 						}
// 						entry += "</table><br><br>";
// 						$("#file_usage_container").append(entry);
// 				});
// 		});
// }

function sidebar(type) {
	var target = "#right_sidebar_list";
	// fill
	$.get("/views/usage/tpl/usage.tpl", function(tpl) {
		$.getJSON(getUrlSidebar(), function(data) {
			// console.log('sidebar data', data);

			for (let i = 0; i < data.length; i++) {
				  data[i].gil_to_name = data[i].gil_to.replace(/_/g," ");
				  data[i].gil_to_id = cleanImageName(data[i].gil_to);
			}

      if (type === "by_num") {
					data = data.sort(function(a,b){
						return b.n - a.n;
					});
			}

			if (type === "by_proj") {
					data = data.sort(function(a,b){
						return b.wiki - a.wiki;
					});
			}

			if (type === "by_name") {
					data = data.sort(function(a,b){
						if(a.gil_to < b.gil_to) return -1;
				    if(a.gil_to > b.gil_to) return 1;
				    return 0;
					});
			}

			var obj = {};
			obj.files = data;
			var template = Handlebars.compile(tpl);
			$(target).html(template(obj));

			let limit = (data.length < 1000) ? data.length : 1000;

			d3.json(getUrl(limit), function(error, detailed_data) {
				if (error) 	window.location.replace('/500');

				// console.log(detailed_data);

				detailed_data.forEach(function(file, idx) {
					let target = $('#' + cleanImageName(file.image) + ' .list_item_panel .wiki_column');
					let currentWiki = null;
					let entry = "";
					entry += "<table>";
					for (let i = 0; i < file.pages.length; i++) {
							if (currentWiki !== file.pages[i].wiki && currentWiki !== null) {
									entry += "</td></tr>";
							}
							if (currentWiki !== file.pages[i].wiki) {
									currentWiki = file.pages[i].wiki;
									entry += "<tr>";
									entry += "<td>";
									entry += "<span style='margin-left:3em;font-size:0.7em;text-decoration:underline'>" + currentWiki + "</span>";
									entry += "</td><td style='padding-left:2em'>";
							}
							//XXX doesn't work with wikidata or wikisource
							entry += "<a href='https://" + currentWiki.replace("wiki","") + ".wikipedia.org/w/index.php?title=" +
								file.pages[i].title +"' style='font-size:0.9em;margin-right:2em'>" + file.pages[i].title.replace(/_/g, " ") + "</a>";
					}
					entry += "</table><br><br>";
					target.append(entry);
				});
			});

			highlight();
		});
	});
}

function highlight() {

	if (ACTIVE_ITEM_ID !== undefined) {
		$('#' + ACTIVE_ITEM_ID).addClass('list_item_active');
	}

	$(".list_item").on("click", function() {

		if ($(this).hasClass('list_item_active')) {
			$(".list_item").removeClass("list_item_active");
			ACTIVE_ITEM_ID = undefined;
		} else {
			$(".list_item").removeClass("list_item_active");
			$(this).addClass("list_item_active")
			ACTIVE_ITEM_ID = $(this).attr("id");
		}

		// TODO highlight bar

	});
}

function sorting_sidebar(){
	$("#by_num").on("click", function(){
		if ($("#by_num").hasClass("active_order") ) {
			//console.log("già selezionato")
		} else {
			$("#by_name").removeClass("active_order");
			$("#by_num").addClass("active_order");
			$("#by_proj").removeClass("active_order");
			sidebar("by_num");
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
			sidebar("by_proj");
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
			sidebar("by_name");
			$("#by_name").css("cursor","default");
			$("#by_num").css("cursor","pointer");
			$("#by_proj").css("cursor","pointer");
		}
	})
}

function cleanImageName(name) {
	// clean special character in order to use image name as element
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
		// console.log("click")
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
	// $("#usage_stat").append("<br><br>");
	$("#usage_stat #distinct-media").append("<p>Distinct media used</p> <div><b>" + formatter(stats_data.totalImagesUsed) + "</b> / <span id='totalMediaNum'></span></div>");
	// $("#usage_stat").append("<br><br>");
	$("#usage_stat #total-projects").append("<p>Total projects involved</p> <b>" + formatter(stats_data.totalProjects) + "</b>");
	// $("#usage_stat").append("<br><br>");
	$("#usage_stat #total-pages").append("<p>Total pages enhanced</p> <b>" + formatter(stats_data.totalPages) + "</b>");
}

$(function() {
	setCategory();
	// dataviz();
	how_to_read();
	sidebar("by_num");
	download();
	switch_page();
	sorting_sidebar();
	drawUsageDataViz();
});
