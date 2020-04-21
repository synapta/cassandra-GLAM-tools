const glam = window.location.href.toString().split('/')[3];
const w = window;
let ACTIVE_ITEM_ID;
let subcategoryName;
let width = 900; ///w.outerWidth,
let height = Math.round(width - (width / 3));

const MAX_LEVEL = 3;
let UNUSED_MODE = false;
let SORT_BY = "by_name";

let margin = {top: 50, right: 50, bottom: 50, left: 50};
let nomargin_w = width - (margin.left + margin.right);
let nomargin_h = height - (margin.top + margin.bottom);

let baseurl = document.location.href;
let h = baseurl.split("/");
let h_1 = h[h.length - 2];
let home = baseurl.replace(h_1 + "/", "");

function getUrl() {
    const urlSplit = window.location.href.toString().split('/');
    let query = UNUSED_MODE ? "?unused=true" : "";
    const db = urlSplit[3];
    let category = urlSplit[urlSplit.length-1]?urlSplit[urlSplit.length-1] : urlSplit[urlSplit.length-2];
    if (category && category !== 'category-network'){
			subcategoryName = decodeURI(category);
			query = UNUSED_MODE ? "?unused=true&cat="+ subcategoryName : "?cat="+subcategoryName;
    }
    return "/api/"+db+"/category" + query;
}

function getUrlDataset() {
    const db = window.location.href.toString().split('/')[3];
    const query = UNUSED_MODE ? "?unused=true" : "";
    return "/api/"+db+"/category/dataset" + query;
}

function unusedFilesLink(category,size) {
    const db = window.location.href.toString().split('/')[3];
    const query = "?unused=true&limit="+size;
    return "/api/"+db+"/category/" +category+ "/"+ query;
}

function dataviz() {
	let  categoryNetworkContainer = $('#category_network_container');
	$('#legend').empty();
	categoryNetworkContainer.empty();
	
	const urlSplit = window.location.href.toString().split('/');
	let query = UNUSED_MODE ? "?unused=true" : "";
	const db = urlSplit[3];
	let data_source =  "/api/"+db+"/category" + query;
	
	d3.json(data_source, function(error, data) {
		if (error){
			window.location.replace('/500');
		}
		
		if (!subcategoryName){
			subcategoryName = data.nodes[0].id;
		}
		
		let levels = [];
		if (data.nodes.length === 0){
			$("#category_network_container").append("<h1>No results with this filters</h1>");
			$("#right-column").hide();
			return;
		}
		
		sidebar();
		
		let width = categoryNetworkContainer.width();
		let height = categoryNetworkContainer.height();
		
		let svg = d3.select("#category_network_container")
			.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height);
		
		let plot = svg.append("g")
			.attr("id", "d3_plot");
		
		let color = d3.scaleOrdinal(d3.schemeCategory20);
		data.nodes.forEach(function(node) {
			levels.push(
				node.group
			);
		});
		let max_level = d3.max(levels);
		let dataLegend = [];
		for (let j = 0; j <= max_level; j++) {
			dataLegend.push(j);
		}
		
		let legendDiv = d3.select("#legend");
		
		let legendRow = legendDiv.selectAll("test")
			.data(dataLegend)
			.enter()
			.append("div")
			.style("margin-bottom", "0.5rem");
		
		legendRow.append("div")
			.html("&nbsp")
			.attr("class", "rect")
			.style("opacity", function(d, i) { if (data.nodes.length > 100 && i > MAX_LEVEL - 1) return "0.2"; else return "1"; })
			.style("background-color", (d, i) => color(i));
		
		legendRow.append("div")
			.style("opacity", function(d, i) { if (data.nodes.length > 100 && i > MAX_LEVEL - 1) return "0.2"; else return "1"; })
			.html(d=> "lv. " + d);
		
		let nodi = [];
		let archi = [];
		//This code is for reduce graph size when too big
		if (data.nodes.length > 100) {
			for (let i = 0; i < data.nodes.length; i++) {
				if (data.nodes[i].group < MAX_LEVEL) {
					nodi.push(data.nodes[i]);
				}
			}
			data.nodes = nodi;
			for (let j = 0; j < data.edges.length; j++) {
				let sourceNode = false, targetNode = false;
				for (let i = 0; i < data.nodes.length; i++) {
					if (data.edges[j].source === data.nodes[i].id ) sourceNode = true;
					if (data.edges[j].target === data.nodes[i].id ) targetNode = true;
				}
				if (sourceNode && targetNode) {
					archi.push(data.edges[j]);
				}
			}
			data.edges = archi;
		}
		
		let files = [];
		data.nodes.forEach(function(node) {
			files.push(
				node.files
			);
		});
		
		let max_file = d3.max(files),
			circle_size = width / max_file / data.nodes.length;
		
		let simulation = d3.forceSimulation()
			.force("link", d3.forceLink().id(function (d) {
					return d.id;
				})
					.distance(function (d, i) {
						return ((max_file * circle_size));
					})
					.strength(0.5)
			)
			.force("charge", d3.forceManyBody())
			.force("center", d3.forceCenter(width / 2, height / 2))
			.force("collide", d3.forceCollide((circle_size * max_file) + 5));
		
		let edges = plot.append("g")
			.attr("class", "edges")
			.selectAll("line")
			.data(data.edges)
			.enter()
			.append("line")
			.attr("class", "line")
			.attr("stroke", "#999");
		
		let nodes = plot.append("g")
			.attr("class", "nodes")
			.selectAll(".nodes")
			.data(data.nodes)
			.enter()
			.append("g")
			.attr("class", function (d, i) {
				return d.id.hashCode() + " node";
			})
			.call(d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended)
			);
		
		let node_circle = nodes.append("circle")
			.attr("r", function (d, i) {
				return Math.min(100, 3 + (d.files * circle_size));
			})
			.attr("fill", function (d) {
				return color(d.group);
			})
			.attr("class", function (d, i) {
				return "disabled_circle circle " + d.files;
			});
		
		simulation.nodes(data.nodes).on("tick", ticked);
		
		simulation.force("link").links(data.edges);
		
		function ticked() {
			let x = 1;
			
			edges
				.attr("x1", function(d) { return d.source.x * x; })
				.attr("y1", function(d) { return d.source.y * x; })
				.attr("x2", function(d) { return d.target.x * x; })
				.attr("y2", function(d) { return d.target.y * x; });
			
			nodes
				.attr("transform", function(d,i) {
					let radius = Math.min(100, 3 + (d.files  * circle_size));
					d.x = Math.max(radius, Math.min(width - radius, d.x));
					d.y = Math.max(radius, Math.min(height - radius, d.y));
					return "translate(" + (d.x * x) + "," + (d.y* x) + ")";
				});
			
			let q = d3.quadtree(nodes),
				i = 0,
				n = nodes.length;
		}
		
		function dragstarted(d) {
			if (!d3.event.active) simulation.alphaTarget(0.3).restart();
			d.fx = d.x;
			d.fy = d.y;
		}
		
		function dragged(d) {
			d.fx = d3.event.x;
			d.fy = d3.event.y;
		}
		
		function dragended(d) {
			if (!d3.event.active) simulation.alphaTarget(0);
			d.fx = null;
			d.fy = null;
		}
	});
}

function sorting_sidebar(){
	let descOrderBtn = $("#desc_order");
	let nameOrderBrn = $("#by_name");
	descOrderBtn.on("click", function(){
		if (!descOrderBtn.hasClass("active_order")) {
			nameOrderBrn.toggleClass("active_order");
			descOrderBtn.toggleClass("active_order");
			$("#category_network_container").find(".circle").removeClass("selected_circle");
			sidebar("desc_order");
			descOrderBtn.css("cursor","default");
			nameOrderBrn.css("cursor","pointer");
		}
	});
	
	nameOrderBrn.on("click", function(){
		if (!nameOrderBrn.hasClass("active_order")){
			nameOrderBrn.toggleClass("active_order");
			descOrderBtn.toggleClass("active_order");
			$("#category_network_container").find(".circle").removeClass("selected_circle");
			sidebar("by_name");
			nameOrderBrn.css("cursor","default");
			descOrderBtn.css("cursor","pointer");
		}
	});
}

function showUnusedFilesItem() {
	if (UNUSED_MODE){
		let id = $('#' + ACTIVE_ITEM_ID).data("category");
		let template_source = "/views/category-network/tpl/unused-file-list.tpl";
		let target = '#category'+ACTIVE_ITEM_ID;
		$('#files' + ACTIVE_ITEM_ID).show();
		$.get( template_source , tpl => {
			$.getJSON( unusedFilesLink(id,30) , d => {
				let template = Handlebars.compile(tpl);
				let temp = [];
				d.forEach( file => {
					let url = '/'+glam+'/file/'+file;
					temp.push(  {
						url: url,
						file: cleanImageName(file.replace(/_/g," "))
					});
				});
				$(target).html(template({files : temp}));
			});
		});
	}
}

function hideUnusedFilesItem() {
	if (UNUSED_MODE){
		let target = '#category'+ACTIVE_ITEM_ID;
		$(target).html("");
		$('#files' + ACTIVE_ITEM_ID).hide();
	}
}

function highlight() {
	if (ACTIVE_ITEM_ID !== undefined) {
		$('#' + ACTIVE_ITEM_ID).closest('.list_item').addClass('list_item_active');
		$("#category_network_container").find("." + ACTIVE_ITEM_ID).children(".circle").addClass("selected_circle");
		showUnusedFilesItem();
	}
	// from Sidebar to Graph
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
			// turn on circle
			let node_selected = $("#category_network_container").find("." + element).children(".circle");
			node_selected.toggleClass("selected_circle");
			ACTIVE_ITEM_ID = element;
			showUnusedFilesItem();
		}
	});
	
	// from Graph to Sidebar
	$(".node").on("click", function() {
		let e = $(this).attr("class");
		let element = e.split(" ",1);
		$('.list_item').removeClass('list_item_active');
		// reset Sidebar - Dataviz
		$("#right_sidebar_list .id").removeClass("selected_list_item");
		$("#category_network_container").find(".circle").removeClass("selected_circle");
		
		// highlight Graph
		let node_selected = $(this).children(".circle");
		node_selected.toggleClass("selected_circle");
		
		// highlight Sidebar
		let selected = $("#right_sidebar_list").find("#" + element);
		ACTIVE_ITEM_ID = element;
		// selected.toggleClass("selected_list_item");
		selected.closest('.list_item').addClass("list_item_active");
		showUnusedFilesItem();
		document.getElementById(element).scrollIntoView({
			// behavior: "smooth",
			block: "center"
		});
		document.getElementById('topbar').scrollIntoView();
	});
}

function resetHighlighted() {
	// reset item highlight
	$('.list_item').removeClass('list_item_active');
	// and circle
	$("#category_network_container").find(".circle").removeClass("selected_circle");
	hideUnusedFilesItem();
}

function sidebar(order) {
	if (order === undefined) {
		order = SORT_BY;
	} else {
		SORT_BY = order;
	}
	
	let template_source = "/views/category-network/tpl/category-network.tpl";
	let data_source = getUrl();
	let target = "#right_sidebar_list";
	
	$.get(template_source , function(tpl) {
		$.getJSON(data_source , function(d) {
			if (d.nodes.length === 0){
				return;
			}
			sortNodes(d,order);
			
			let template = Handlebars.compile(tpl);
			$(target).html(template(d));
			
			sorting_sidebar();
			d.nodes.forEach(node => {
				let node_selected = $("#category_network_container").find("." + node.id_encoded).children(".circle");
				node_selected.removeClass("disabled_circle");
			});
			
			highlight();
		});
	});
}

function download() {
    $('#download_dataset_link').remove();
    $('<a id="download_dataset_link" href="' + getUrlDataset() + '" download="' + "category_network.csv" + '">Download dataset</a>').appendTo('#download_dataset');
}

$("#how_to_read_button").click(function(){
    $(".how_to_read").toggleClass("show");
});

$('#unusedModeCheckbox').click(function() {
    const self = this;
    if (self.checked) { // switching on
	UNUSED_MODE = true;
	dataviz();
	sidebar();
	download();
    } else { // switching off
	UNUSED_MODE = false;
	dataviz();
	sidebar();
	download();
    }
});

$('#showUnused').click( () => {
	let template_source = "/views/category-network/tpl/unused-file-list-dropdown.tpl";
	let target = '#unusedList';
	if ($(target).is(":hidden")){
		$.get( template_source , tpl => {
			$.getJSON( unusedFilesLink(subcategoryName,100) , d => {
				let template = Handlebars.compile(tpl);
				let temp = [];
				d.forEach( file => {
					let url = '/'+glam+'/file/'+file;
					temp.push(  {
						url: url,
						file: cleanImageName(file.replace(/_/g," "))
					});
				});
				$(target).html(template({files : temp}));
			});
		});
		$(target).show();
	} else {
		$(target).hide();
	}
});

$(document).ready(function(){
    dataviz();
    switch_page();
    download();
    setCategory();
});
