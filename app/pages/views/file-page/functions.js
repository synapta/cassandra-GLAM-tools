function getCategoryUrl() {
    var db = window.location.href.toString().split('/')[3];
    return "/api/" + db + "/category";
}

function getUsageUrl() {
    var db = window.location.href.toString().split('/')[3];
    return "/api/" + db + "/usage/top";
}

function getFileDetailsUrl() {
    var db = window.location.href.toString().split('/')[3];
    var file = window.location.href.toString().split('/')[5];
    return "/api/" + db + "/file/details/" + file;
}

function getUsageDetailsUrl() {
    var db = window.location.href.toString().split('/')[3];
    var file = window.location.href.toString().split('/')[5];
    return "/api/" + db + "/usage/file/" + file;
}

function getRecommenderUrl() {
    var db = window.location.href.toString().split('/')[3];
    var file = window.location.href.toString().split('/')[5];
    return "/api/" + db + "/recommender/" + file;
}

function getWikiDataUrl(ids) {
	const url = "https://www.wikidata.org/w/api.php?action=wbgetentities&props=labels|sitelinks/urls&languages=en|fr|de|it&sitefilter=enwiki|frwiki|dewiki|itwiki&format=json";
	let idMerge = "&ids=";
	for (let i = 0; i<ids.length-1; i++){
		idMerge += ids[i].title+"|";
	}
	idMerge += ids[ids.length-1].title;
	return url + idMerge;
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

function getImageCommonsUrlApi() {
    var file = window.location.href.toString().split('/')[5];
    var base_url = "https://commons.wikimedia.org/wiki/Special:FilePath/";
    return base_url + file;
}

function getThumbnailUrl(size_in_px, callback) {
    var file = window.location.href.toString().split('/')[5];
    var base_url = "https://upload.wikimedia.org/wikipedia/commons/thumb";
    
    var hash = CryptoJS.MD5(decodeURIComponent(file)).toString(CryptoJS.enc.Hex);
    // console.log(hash);
    if (callback && typeof(callback) == "function") {
	var img_url = base_url + "/" + hash.substring(0, 1) + "/" + hash.substring(0, 2) + "/" + fixedEncodeURIComponent(file).replace(/%25C3%25/g,"%C3%") + "/" + size_in_px.toString() + "px-thumbnail.jpg";
	callback(img_url);
    }
    
}

function fixedEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
	return '%' + c.charCodeAt(0).toString(16);
    });
}

function populateSidebar() {
	var WIKI_ARRAY = [];
	$.get("/views/file-page/tpl/file-template.tpl", function(tpl) {
		// get details on views and category
		$.getJSON(getFileDetailsUrl(), function (details_data) {
			// get usage data
			$.getJSON(getUsageDetailsUrl(), function (usage_data) {
				// get recommender data
				$.getJSON(getRecommenderUrl(), function (rec_data) {
					let file = usage_data[0] ? usage_data[0] : {usage: 0, projects: 0};
					// get image thumbnail
					getThumbnailUrl(500, function (thumbnail_url) {
						// console.log(thumbnail_url);
						file.thumbnail_url = thumbnail_url;
						// add views and category
						file.tot = nFormatter(details_data.tot);
						file.av = nFormatter(details_data.avg);
						file.median = nFormatter(details_data.median);
						file.cats = [];
						details_data.categories.forEach((c) => {
							let obj = {};
							obj.cat_name = c.replace(/_/g, " ");
							file.cats.push(obj);
						});
						file.cat_number = details_data.categories.length;
						if (file.cat_number === 1) {
							file.cat_title = "CATEGORY";
						} else {
							file.cat_title = "CATEGORIES";
						}
						// Format name and id
						file.image_name = file.image ? file.image.replace(/_/g, " ") : "";
						file.image_id = file.image ? cleanImageName(file.image) : "";
						// Format wiki pages list
						let currentWiki = null;
						file.wiki_array = [];
						file.wikis = [];
						// sort alphabetically
						file.pages = file.pages ? file.pages.sort(function (a, b) {
							if (a.wiki < b.wiki) return -1;
							if (a.wiki > b.wiki) return 1;
							return 0;
						}) : [];
						// loop through all pages
						let wiki_obj = {};
						if (file.pages) {
							file.pages.forEach(function (page) {
								// format object
								let link_obj = {};
								// check if not already added
								if (currentWiki !== page.wiki) {
									// reset temp object
									wiki_obj = {};
									wiki_obj.wiki_links = [];
									// update current wiki
									currentWiki = page.wiki;
									// page name
									wiki_obj.wiki_name = currentWiki;
									// links
									link_obj.wiki_link = `https://${currentWiki.replace("wiki", "")}.wikipedia.org/w/index.php?title=${page.title}`;
									link_obj.wiki_page = page.title.replace(/_/g, " ");
									// push
									wiki_obj.wiki_links.push(link_obj);
									file.wikis.push(wiki_obj);
									// save wiki list in an array (for highlighting bars in chart)
									file.wiki_array.push(currentWiki);
									WIKI_ARRAY.push(currentWiki);
								} else {
									// add link to current wiki object
									link_obj.wiki_link = `https://${currentWiki.replace("wiki", "")}.wikipedia.org/w/index.php?title=${page.title}`;
									link_obj.wiki_page = page.title.replace(/_/g, " ");
									// push current wiki object
									wiki_obj.wiki_links.push(link_obj);
								}
							});
						}
						file.wiki_array = JSON.stringify(file.wiki_array);
						
						// recommender
						//get data from wiki
						if (rec_data.length) {
							$.getJSON(getWikiDataUrl(rec_data), function (wikidata) {
								for (let i = 0; i < rec_data.length; i++) {
									let data = wikidata.entities[rec_data[i].title];
									rec_data[i].wikis = [];
									if (data.labels && !isEmpty(data.labels)) {
										if (data.labels.en) {
											rec_data[i].label = data.labels.en.value;
										} else {
											rec_data[i].label = data.labels[Object.keys(data.labels)[0]].value;
										}
									}
									for (const prop in data.sitelinks){
										if (data.sitelinks.hasOwnProperty(prop)){
											rec_data[i].wikis.push(data.sitelinks[prop]);
										}
									}
								}
								file.recommender = rec_data;
								
								// compile template
								let template = Handlebars.compile(tpl);
								
								$('#right-column').html(template(file));
								
								// draw data viz
								usageDataViz(WIKI_ARRAY);
							});
						} else {
							file.recommender = rec_data;
							
							// compile template
							var template = Handlebars.compile(tpl);
							
							$('#right-column').html(template(file));
							
							// draw data viz
							usageDataViz(WIKI_ARRAY);
						}
					});
				});
			});
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
	// institution name
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
    // networkDataviz();
    // usage
    // usageDataViz();
    // views
    lineChartDraw();
});
