let page = 0;
let limit = false;
function search(append) {
	const db = window.location.href.toString().split('/')[3];
	const query = window.location.href.toString().split('/')[5];
	const params = "?page="+page+"&limit=100";
	const url = "/api/" + db + "/search/%25"+query+"%25"+params;
	if (page === 0){
		$('#resultsSearch').off("scroll").scroll(loadMoreOnScroll.bind($('#resultsSearch')));
	}
	$("#searchFilesBar").val(decodeURI(query).replace("_"," "));
	// let template_source = "/views/category-network/tpl/unused-file-list-dropdown.tpl";
	let target = '#resultsSearch';
	let tpl = "    {{#each files}}\n" +
		"    <div class=\"m-0 p-0 mr-5 ml-2 col-5 text-truncate\" style='height: 2rem'>\n" +
		"        <a href=\"{{url}}\" style=\"font-size:0.8em;text-overflow: ellipsis\">{{file}}</a>\n" +
		"    </div>\n" +
		"    {{/each}}";
	
		$.getJSON( url , d => {
			let template = Handlebars.compile(tpl);
			let temp = [];
			if (d.length === 0){
				// show "no more elements"
				$('#resultsSearch').append('<h3 class="col-12 text-center">No more elements to load</h3>');
				limit = true;
				// remove handler
				$('#resultsSearch').off('scroll', loadMoreOnScroll);
			} else {
				d.forEach( file => {
					let url = '/'+db+'/file/'+file;
					temp.push(  {
						url: url,
						file: cleanImageName(file.replace(/_/g," "))
					});
				});
				if (append){
					$(target).append(template({files : temp}));
				} else {
					$(target).html(template({files : temp}));
				}
			}
		});
}

function searchFiles(force) {
	let search = $("#searchFilesBar").val();
	if(event && event.keyCode === 13){
		force = true;
	}
	if (force){
		if (search.length >= 3){
			let db = window.location.href.split("/")[3];
			search = search.replace(/\s/g,"_");
			window.location.href = "/"+db+"/search/"+search;
		} else {
			$('#resultsSearchBar').popover('show');
		}
	}
}

function loadMoreOnScroll() {
	if (($("#resultsSearch").scrollTop() + $("#resultsSearch").innerHeight() >= $("#resultsSearch")[0].scrollHeight) && !limit) {
		// if reached end of div and there are more elements to load
		// calc new page number
		page++;
		search(true);
	}
}

$(function() {
	search();
	setCategory();
	let db = window.location.href.toString().split('/')[3];
	$("#institutionId").attr("href", "/"+db);
});
