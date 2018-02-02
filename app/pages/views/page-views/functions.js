function getUrlAll(){
	var db=window.location.href.toString().split('/')[3];
	return "../../api/"+db+"/views/by-date";
}
function getUrlFiles(){
	var db=window.location.href.toString().split('/')[3];
	return "../../api/"+db+"/views/files";
}
function getUrlSidebar(){
	var db=window.location.href.toString().split('/')[3];
	return "../../api/"+db+"/views/sidebar";
}
function setCategory() {
	var db=window.location.href.toString().split('/')[3];
	var jsonurl= "../../api/"+db+"/rootcategory";
	$.getJSON(jsonurl, function(d) {
	$('#cat_url').text(decodeURIComponent(d.id).replace(/_/g," "));
	$("#cat_url").attr("href", "https://commons.wikimedia.org/w/index.php?title=Category:"+d.id);
	$("#cat_url").attr("title", decodeURIComponent(d.id).replace(/_/g," "));
	});
}

function sidebar(type){
	var template_source = "tpl/views.tpl";
	var data_source = getUrlSidebar();
	var target = "#sidebar";

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
		if ($("#by_num").hasClass("underline") ) {
			//console.log("già selezionato")
		} else {
			$("#by_name").removeClass("underline");
			$("#by_num").addClass("underline");
			$("#by_median").removeClass("underline");
			sidebar("by_num");
			$("#by_num").css("cursor","default");
			$("#by_name").css("cursor","pointer");
			$("#by_median").css("cursor","pointer");
		}
	})

	$("#by_median").on("click", function(){
		if ($("#by_median").hasClass("underline") ) {
			//console.log("già selezionato")
		} else {
			$("#by_name").removeClass("underline");
			$("#by_num").removeClass("underline");
			$("#by_median").addClass("underline");
			sidebar("by_median");
			$("#by_name").css("cursor","pointer");
			$("#by_num").css("cursor","pointer");
			$("#by_median").css("cursor","default");
		}
	})

	$("#by_name").on("click", function(){
		if ($("#by_name").hasClass("underline") ) {
			//console.log("già selezionato")
		} else {
			$("#by_name").addClass("underline");
			$("#by_num").removeClass("underline");
			$("#by_median").removeClass("underline");
			sidebar("by_name");
			$("#by_name").css("cursor","default");
			$("#by_num").css("cursor","pointer");
			$("#by_median").css("cursor","pointer");
		}
	})
}

function download(){
	var baseurl = document.location.href;
	var h = baseurl.split("/")
	var h_1 = h[h.length-2]
	var home = baseurl.replace(h_1 + "/","")
	var dataset_location = home + getUrlAll();

	$('<a href="' + dataset_location + '" download="' + "views.json" + '">Download dataset</a>').appendTo('#download_dataset');
}

function switch_page() {
  var baseurl = document.location.href;
	var h = baseurl.split("/")
	var h_1 = h[h.length-2]
	var home = baseurl.replace(h_1 + "/","")
	//console.log(home)

	$('#switch_page').change(function(){
		var page = $(this).val();
		var url = home + page;
		console.log(url);

		if (url != '') {
			window.location = url;
		}
		return false;
	});
}

function how_to_read(){
	button = $("#how_to_read_button");
	box = $(".how_to_read");

	$("#how_to_read_button").click(function(){
		box.toggleClass("show");
		// console.log("click")
	});
};

function switch_page() {
var baseurl = document.location.href;
	var h = baseurl.split("/")
	var h_1 = h[h.length-2]
	var home = baseurl.replace(h_1 + "/","")
	//console.log(home)

	$('#switch_page').change(function(){
		var page = $(this).val();
		var url = home + page;
		console.log(url);

		if (url != '') {
			window.location = url;
		}
		return false;
	});
}

function highlight(){
	$(".list_item").on("click", ".item" , function(){
		var element = $(this).attr("id");

		// reset Sidebar - Dataviz
		$("#sidebar .id").removeClass("selected_list_item");

		// highlight Sidebar
		$(this).toggleClass("selected_list_item");

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
				  window.location.href('/404');
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
