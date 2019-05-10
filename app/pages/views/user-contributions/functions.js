function getUrl(){
	var db=window.location.href.toString().split('/')[3];
	return "/api/"+db+"/file/upload-date";
}
function getUrlAll(){
	var db=window.location.href.toString().split('/')[3];
	return "/api/"+db+"/file/upload-date-all";
}

function pad (str, max) {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}

function sidebar(type){
		var template_source = "/views/user-contributions/tpl/user-contributions.tpl";
		var target = "#sidebar";

		$.get(template_source, function(tpl) {
				$.getJSON(getUrl(), function(data) {
						data.forEach(function (d) {
								let total = 0;

								d.files.forEach(function (d) {
										total += +d.count
								})
								d.total = total;
						})

			      if (type === "by_num") {
								data = data.sort(function(a,b){
									return b.total - a.total;
								});
						}

						data.forEach(function (d) {
								d.total = nFormatter(d.total);
						})

						var template = Handlebars.compile(tpl);
						$(target).html(template({"users": data}));

						highlight()
				});
		});
}

function sorting_sidebar(){
	$("#by_num").on("click", function(){
		if ($("#by_num").hasClass("underline") ) {
			//console.log("già selezionato")
		} else {
			$("#by_name").toggleClass("underline");
			$("#by_num").toggleClass("underline");
			sidebar("by_num");
			$("#by_num").css("cursor","default");
			$("#by_name").css("cursor","pointer");
		}
	})

	$("#by_name").on("click", function(){
		if ($("#by_name").hasClass("underline") ) {
			//console.log("già selezionato")
		} else {
			$("#by_name").toggleClass("underline");
			$("#by_num").toggleClass("underline");
			sidebar("by_name");
			$("#by_name").css("cursor","default");
			$("#by_num").css("cursor","pointer");
		}
	})
}

function download(){
	$('<a href="' + getUrl() + '" download="' + "user_contributions.json" + '">Download dataset</a>').appendTo('#download_dataset');
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

$(document).ready(function(){
		setCategory();
		sidebar("by_num");
		dataviz();
		how_to_read();
		download();
		switch_page();
		sorting_sidebar();
})
