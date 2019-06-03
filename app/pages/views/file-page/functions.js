function getCategoryUrl() {
	var db = window.location.href.toString().split('/')[3];
	return "/api/" + db + "/category";
}

function getUsageUrl() {
	var db = window.location.href.toString().split('/')[3];
	// var file = window.location.href.toString().split('/')[5];
	return "/api/" + db + "/usage/top";
}

function getUsageDetailsUrl() {
	var db = window.location.href.toString().split('/')[3];
	var file = window.location.href.toString().split('/')[5];
	return "/api/" + db + "/usage/file/" + file;
}

function getUsageStatsUrl() {
	var db = window.location.href.toString().split('/')[3];
	return "/api/" + db + "/usage/stats";
}

function getViewsUrl() {
	var db = window.location.href.toString().split('/')[3];
	return "/api/" + db + "/views";
}

function getFileViewsUrl() {
	var db = window.location.href.toString().split('/')[3];
	var file = window.location.href.toString().split('/')[5];
	return "/api/" + db + "/views/file/" + file;
}

function cleanImageName(name) {
	// clean special characters in order to use image name as element ID
	return name.replace(/jpg/i, "").replace(/png/i, "").replace(/[{()}]/g, "").replace(/\./g,"").replace(/\,/g,"").replace(/&/g,"").replace(/'/g,"").replace(/"/g,"");
}

function populateSidebar() {
	var WIKI_ARRAY = [];
	$.get("/views/file-page/tpl/file-template.tpl", function(tpl) {
		// get data
		$.getJSON(getUsageDetailsUrl(), function(data) {
			console.log(data);
			// render first part
			data.forEach(function(file) {
				// Format name and id
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
						WIKI_ARRAY.push(currentWiki);
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

			// compile template
			var obj = {};
			obj.files = data;
			var template = Handlebars.compile(tpl);

			$('#right-column').html(template(obj));

			// draw data viz
			usageDataViz(WIKI_ARRAY);
		});
	});
}

function setDetails() {
  	var db = window.location.href.toString().split('/')[3];
  	var file = window.location.href.toString().split('/')[5];
  	var jsonurl = "/api/" + db;

  	$.getJSON(jsonurl, function(d) {
				$('#totalMediaNum').text(formatter(d.files));
				// file name
      	$('#file_url').text(file.replace(/_/g, " "));
      	$("#file_url").attr("href", "https://commons.wikimedia.org/wiki/File:" + file);
      	$("#file_url").attr("title", file.replace(/_/g, " "));
				// category
      	$('#cat_url').text(decodeURIComponent(d.category).replace("Category:",""));
      	$("#cat_url").attr("href", "https://commons.wikimedia.org/wiki/"+d.category);
      	$("#cat_url").attr("title", decodeURIComponent(d.category));
				// instittion name
        $(".glamName").text(d.fullname);
        $(".glamName").attr('href', '/' + db);
        $('#cover').css('background-image', 'url(' + d.image + ')');
  	});

    //XXX needed for correct urls
    let baseUrl = window.location.href + "/";
    baseUrl = baseUrl.replace(/\/\/$/,"/");
    $("#basebase").attr("href", baseUrl);
}

$(function() {
	// TEMP
	setDetails();
	// sidebar
	populateSidebar();
	// category network
	networkDataviz();
	// usage
	// usageDataViz();
	// views
	lineChartDraw();
});
