function getUrlAll(){
	var db=window.location.href.toString().split('/')[3];
	return "/api/"+db+"/views";
}
function getUrlFiles(){
	var db=window.location.href.toString().split('/')[3];
	return "/api/"+db+"/views/files";
}
function getUrlSidebar(){
	var db=window.location.href.toString().split('/')[3];
	return "/api/"+db+"/views/sidebar";
}

function sidebar(type){
	var template_source = "/views/page-views/tpl/views.tpl";
	var data_source = getUrlSidebar();
	var target = "#right_sidebar_list";

	$.get( template_source , function(tpl) {
		$.getJSON( data_source , function(data) {

			if (type === "by_num") {
					data = data.sort(function(a,b){
						return b.tot - a.tot;
					});
			}

			if (type === "by_median") {
					data = data.sort(function(a,b){
						return b.median - a.median;
					});
			}

			for (let i = 0; i < data.length; i++) {
				  data[i].img_name_text = data[i].img_name.replace(/_/g," ");
					data[i].tot = nFormatter(+data[i].tot);
					data[i].av = nFormatter(+data[i].av);
					data[i].median = nFormatter(+data[i].median);
			}

			if (type === "by_name") {
					data = data.sort(function(a,b){
						if(a.img_name < b.img_name) return -1;
				    if(a.img_name > b.img_name) return 1;
				    return 0;
					});
			}

			var obj = {};
			obj.files = data;
			var template = Handlebars.compile(tpl);
			$(target).html(template(obj));

			highlight()
		});
	});
}

function sorting_sidebar(){
	$("#by_num").on("click", function(){
		if ($("#by_num").hasClass("active_order") ) {
			//console.log("già selezionato")
		} else {
			$("#by_name").removeClass("active_order");
			$("#by_num").addClass("active_order");
			$("#by_median").removeClass("active_order");
			sidebar("by_num");
			$("#by_num").css("cursor","default");
			$("#by_name").css("cursor","pointer");
			$("#by_median").css("cursor","pointer");
		}
	})

	$("#by_median").on("click", function(){
		if ($("#by_median").hasClass("active_order") ) {
			//console.log("già selezionato")
		} else {
			$("#by_name").removeClass("active_order");
			$("#by_num").removeClass("active_order");
			$("#by_median").addClass("active_order");
			sidebar("by_median");
			$("#by_name").css("cursor","pointer");
			$("#by_num").css("cursor","pointer");
			$("#by_median").css("cursor","default");
		}
	})

	$("#by_name").on("click", function(){
		if ($("#by_name").hasClass("active_order") ) {
			//console.log("già selezionato")
		} else {
			$("#by_name").addClass("active_order");
			$("#by_num").removeClass("active_order");
			$("#by_median").removeClass("active_order");
			sidebar("by_name");
			$("#by_name").css("cursor","default");
			$("#by_num").css("cursor","pointer");
			$("#by_median").css("cursor","pointer");
		}
	})
}

function download(){
	$('<a href="' + getUrlAll() + '" download="' + "views.json" + '">Download dataset</a>').appendTo('#download_dataset');
}

function how_to_read(){
	button = $("#how_to_read_button");
	box = $(".how_to_read");

	$("#how_to_read_button").click(function(){
		box.toggleClass("show");
		// console.log("click")
	});
};

function highlight(){
	$(".list_item").on("click", function() {

		var element = $(this).attr("id");

		if ($(this).hasClass('list_item_active')) {
			$(".list_item").removeClass("list_item_active");
		} else {
			$(".list_item").removeClass("list_item_active");
			$(this).addClass("list_item_active")
		}

		// highlight Graph
		document.getElementById(element+"_viz").scrollIntoView({
				//behavior: "smooth",
				block: "start"
		});
		document.getElementById('topbar').scrollIntoView();
	});
}

function statDraw() {
	d3.json(getUrlAll(), function (error, data) {
		  if (error) {
				  window.location.href('/500');
			}
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
	sidebar("by_num");
	download();
	switch_page();
	sorting_sidebar();
	lineChartDraw("main_views_container", getUrlAll());
	statDraw();
})
