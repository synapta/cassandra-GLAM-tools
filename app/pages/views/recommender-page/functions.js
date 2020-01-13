const glam = window.location.href.toString().split('/')[3];
const db = window.location.href.toString().split('/')[3];
const query = window.location.href.toString().split('/')[5];
let page = 0;
let limit = 5;
let stopScroll = false;
let category;

function getThumbnailUrl(file, size_in_px, callback) {
	var base_url = "https://upload.wikimedia.org/wikipedia/commons/thumb";
	
	let hash = CryptoJS.MD5(decodeURIComponent(file)).toString(CryptoJS.enc.Hex);
	// console.log(hash);
	if (callback && typeof(callback) == "function") {
		const img_url = base_url + "/" + hash.substring(0, 1) + "/" + hash.substring(0, 2) + "/" + fixedEncodeURIComponent(file).replace(/%25C3%25/g, "%C3%") + "/" + size_in_px.toString() + "px-thumbnail.jpg";
		callback(img_url);
	}
	
}

function getWikiDataUrl(ids) {
	const url = "https://www.wikidata.org/w/api.php?action=wbgetentities&props=labels|sitelinks/urls&languages=en|fr|de|it&sitefilter=enwiki|frwiki|dewiki|itwiki&format=json";
	let idMerge = "&ids=";
	for (let i = 0; i<ids.length-1; i++){
		idMerge += ids[i]+"|";
	}
	idMerge += ids[ids.length-1];
	return url + idMerge;
}

function getUrl() {
	const urlSplit = window.location.href.toString().split('/');
	let query = "?page="+page+"&limit="+limit;
	const db = urlSplit[3];
	category = urlSplit[5];
	if (category){
		query = "?unused=true&cat="+ category;
	}
	return "/api/"+db+"/recommender" + query;
}

function getFiles() {
	$.get("/views/recommender-page/recommender.tpl", function (tpl) {
		$.getJSON(getUrl(), function (files) {
			if (files.length === 0){
				$('#resultsSearch').append('<h3 class="col-12 text-center">No more elements to load</h3>');
				stopScroll = true;
				// remove handler
			}
			// get image thumbnail
			for (let i = 0; i < files.length; i++) {
				getThumbnailUrl(files[i].img_name, 500, function (thumbnail_url) {
					// console.log(thumbnail_url);
					files[i].thumbnail_url = thumbnail_url;
					// add views and category;
					files[i].image_name = files[i].img_name ? files[i].img_name.replace(/_/g, " ") : "";
					files[i].image_id = files[i].img_name ? cleanImageName(files[i].img_name) : "";
					
					// recommender
					//get data from wiki
					$.getJSON(getWikiDataUrl(files[i].titles), function (wikidata) {
						let base = "https://www.wikidata.org/wiki/";
						files[i].wikis = [];
						for (let j = 0; j < files[i].titles.length; j++) {
							files[i].wikis.push(
								{
									title: files[i].titles[j],
									url: base + files[i].titles[j]
								}
							);
						}
						
						for (let j = 0; j < files[i].wikis.length; j++) 		{
							let data = wikidata.entities[files[i].wikis[j].title];
							if (data.labels && !isEmpty(data.labels)) {
								if (data.labels.en) {
									files[i].wikis[j].label = data.labels.en.value;
								} else {
									files[i].wikis[j].label = data.labels[Object.keys(data.labels)[0]].value;
								}
							}
							files[i].wikis[j].media = [];
							for (const prop in data.sitelinks) {
								if (data.sitelinks.hasOwnProperty(prop)) {
									let lang = prop.split("wiki")[0];
									let wiki = {};
									wiki.url = data.sitelinks[prop].url;
									wiki.lang = lang;
									wiki.label = data.sitelinks[prop].title;
									files[i].wikis[j].media.push(wiki);
								}
							}
						}
						// compile template
						let template = Handlebars.compile(tpl);
						$('#resultsSearch').append(template(files[i]));
					});
				});
			}
		});
	});
}

function loadMore() {
	if (!stopScroll) {
		// if reached end of div and there are more elements to load
		// calc new page number
		page++;
		getFiles();
	}
}

$(function() {
	setCategory();
	let db = window.location.href.toString().split('/')[3];
	$("#institutionId").attr("href", "/"+db);
	getFiles();
});