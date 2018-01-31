function getUrl(){
	var db=window.location.href.toString().split('/')[3];
	return "../../api/"+db+"/usage";
}
function getUrlAll(){
	var db=window.location.href.toString().split('/')[3];
	return "../../api/"+db+"/usage/stat";
}
function getUrlTop20(){
	var db=window.location.href.toString().split('/')[3];
	return "../../api/"+db+"/usage/top";
}
function getUrlSidebar(){
	var db=window.location.href.toString().split('/')[3];
	return "../../api/"+db+"/usage/sidebar";
}

function dataviz(){
	  d3.json(getUrl(), function(error, data) {
				if (error)
						window.location.replace('404');

				/*data.users = data.users.sort(function(a,b){
					return b.total - a.total;
				});*/

				data.forEach(function(file) {
					  $("#file_usage_container").append("<h2 style='margin-left:1.5em' id='" + file.image + "_viz'>" + file.image.replace(/_/g, " ") + "</h2>")
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
						$("#file_usage_container").append(entry);
				});
		});
}

function sidebar(type){
	var template_source = "tpl/usage.tpl";
	var data_source = getUrlSidebar();
	var target = "#sidebar";

	$.get( template_source , function(tpl) {
		$.getJSON( data_source , function(data) {

			for (let i = 0; i < data.length; i++) {
				  data[i].gil_to_name = data[i].gil_to.replace(/_/g," ");
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
			$("#by_proj").removeClass("underline");
			sidebar("by_num");
			$("#by_num").css("cursor","default");
			$("#by_name").css("cursor","pointer");
			$("#by_proj").css("cursor","pointer");
		}
	})

	$("#by_proj").on("click", function(){
		if ($("#by_proj").hasClass("underline") ) {
			//console.log("già selezionato")
		} else {
			$("#by_name").removeClass("underline");
			$("#by_num").removeClass("underline");
			$("#by_proj").addClass("underline");
			sidebar("by_proj");
			$("#by_name").css("cursor","pointer");
			$("#by_num").css("cursor","pointer");
			$("#by_proj").css("cursor","default");
		}
	})

	$("#by_name").on("click", function(){
		if ($("#by_name").hasClass("underline") ) {
			//console.log("già selezionato")
		} else {
			$("#by_name").addClass("underline");
			$("#by_num").removeClass("underline");
			$("#by_proj").removeClass("underline");
			sidebar("by_name");
			$("#by_name").css("cursor","default");
			$("#by_num").css("cursor","pointer");
			$("#by_proj").css("cursor","pointer");
		}
	})
}

function download(){
	var baseurl = document.location.href;
	var h = baseurl.split("/")
	var h_1 = h[h.length-2]
	var home = baseurl.replace(h_1 + "/","")
	var dataset_location = home + getUrl();

	$('<a href="' + dataset_location + '" download="' + "usage.json" + '">Download dataset</a>').appendTo('#download_dataset');
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
				behavior: "smooth",
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
			$("#usage_stat").append("Distinct media used: <b>" + data.totalImagesUsed + "</b> / <span id='totalMediaNum'></span>");
			$("#usage_stat").append("<br><br>");
			$("#usage_stat").append("Total projects involved: <b>" + data.totalProjects + "</b>");
			$("#usage_stat").append("<br><br>");
			$("#usage_stat").append("Total pages enhanced: <b>" + data.totalPages + "</b>");

			setTotalMediaNum();
	});
}

$(document).ready(function(){
	setCategory();
	dataviz();
	how_to_read();
	sidebar("by_num");
	download();
	switch_page();
	sorting_sidebar();
	donutChartDraw("usage_donut", getUrlTop20());
	statDraw();
})
