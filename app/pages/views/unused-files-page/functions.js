const glam = window.location.href.toString().split('/')[3];
const db = window.location.href.toString().split('/')[3];
const query = window.location.href.toString().split('/')[5];
let page = 0;
let ACTIVE_ITEM_ID;
let SORT_BY = "by_name";
let limit = true;
let category;

function getUrl() {
	let queryS = "?unused=true";
	category = urlSplit[5];
	if (category){
		queryS = "?unused=true&cat="+ category;
	}
	return "/api/"+db+"/category" + queryS;
}

function highlight() {
	if (ACTIVE_ITEM_ID !== undefined) {
		$('#' + ACTIVE_ITEM_ID).closest('.list_item').addClass('list_item_active');
		showUnusedFilesItem();
	}
	$(".list_item").on("click", function() {
		let element = $(this).find(".id").attr("id");
		if ($(this).hasClass('list_item_active')) {
			// reset
			resetHighlighted();
			ACTIVE_ITEM_ID = undefined;
		} else {
			// reset
			resetHighlighted();
			// highlight item
			$(this).addClass('list_item_active');
			ACTIVE_ITEM_ID = element;
			showUnusedFilesItem();
		}
	});
}

function resetHighlighted() {
	// reset item highlight
	$('.list_item').removeClass('list_item_active');
	$('.viewFiles').addClass('hiddenBtn');
	hideUnusedFilesItem();
}

function sorting_table(){
	$("#by_total").on("click", function(){
		if ($("#by_total").hasClass("active_order")){
			console.log("già selezionato");
		} else {
			$("#by_level").toggleClass("active_order");
			$("#by_total").toggleClass("active_order");
			getCategories("desc_order");
			$("#by_total").css("cursor","default");
			$("#by_level").css("cursor","pointer");
		}
	});
	
	$("#by_level").on("click", function(){
		if ($("#by_level").hasClass("active_order") ) {
			//console.log("già selezionato")
		} else {
			$("#by_level").toggleClass("active_order");
			$("#by_total").toggleClass("active_order");
			$("#by_level").css("cursor","default");
			$("#by_total").css("cursor","pointer");
			getCategories("by_name");
		}
	});
}

function unusedFilesLink(id,size,pageSel) {
	const queryS = "?unused=true&limit="+size+"&page="+pageSel;
	return "/api/"+db+"/category/" +id+ "/"+ queryS;
}
function getFiles(id,target,templateSource,total) {
	$.get( templateSource , tpl => {
		$.getJSON(unusedFilesLink(id,total < 1500 ? total : 1500,0) , d => {
			let template = Handlebars.compile(tpl);
			let temp = [];
			d.forEach( file => {
				let url = '/'+glam+'/file/'+file;
				temp.push(  {
					url: url,
					file: cleanImageName(file.replace(/[-_]/g," "))
				});
			});
			
				$(target).html(template({files : temp}));
				
		});
	});
}

function showUnusedFilesItem() {
	let id = $('#' + ACTIVE_ITEM_ID).data("category");
	let tot = $('#' + ACTIVE_ITEM_ID).data("total");
	let target = '#category'+ACTIVE_ITEM_ID;
	let template_source = "/views/unused-files-page/unused-file-list-dropdown.tpl";
	getFiles(id,target,template_source,tot);
	$('#files' + ACTIVE_ITEM_ID).show();
}

function hideUnusedFilesItem() {
	let target = '#category'+ACTIVE_ITEM_ID;
	$(target).html("");
	$('#files' + ACTIVE_ITEM_ID).hide();
}

function getCategories(order){
	if (order === undefined) {
		order = SORT_BY;
	} else {
		SORT_BY = order;
	}
	let data_source = getUrl();
	let target = "#resultsSearch";
	$.getJSON(data_source , function(d) {
		sortNodes(d,order);
		if (d.nodes.length > 0){
			let template_source = "/views/unused-files-page/categories.tpl";
			$.get( template_source , function(tpl) {
				let template = Handlebars.compile(tpl);
				$(target).html(template(d));
				sorting_table();
				highlight();
			});
		} else {
			$(target).html("<h1>No files</h1>");
		}
	});
}

$(document).ready(function(){
	setCategory();
	$("#institutionId").attr("href", "/"+db);
	getCategories();
});
