var w = window;
var width = 900, ///w.outerWidth,
height = Math.round(width - (width / 3));

const MAX_LEVEL = 3;

var margin = {top: 50, right: 50, bottom: 50, left: 50},
nomargin_w = width - (margin.left + margin.right),
nomargin_h = height - (margin.top + margin.bottom);

var baseurl = document.location.href;
var h = baseurl.split("/")
var h_1 = h[h.length-2]
var home = baseurl.replace(h_1 + "/","")

function getUrl() {
		var db=window.location.href.toString().split('/')[3];
		return "/api/"+db+"/category";
}

function dataviz() {
		var data_source = getUrl();

		var width = $("#category_network_container").width(),
			height = $("#category_network_container").height();

		var svg = d3.select("#category_network_container")
			.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)

		var plot = svg.append("g")
			.attr("id", "d3_plot")

		var color = d3.scaleOrdinal(d3.schemeCategory20);

		d3.json(data_source, function(error, data) {
				if (error)
					window.location.replace('/500');

				var levels = [];
				data.nodes.forEach(function(node) {
						levels.push(
								node.group
						);
				})
				var max_level = d3.max(levels);
				var dataLegend = [];
				for (var j = 0; j <= max_level; j++) {
						dataLegend.push(j);
				}

				var legendDiv = d3.select("#legend");

				var legendRow = legendDiv.selectAll("test")
				    .data(dataLegend)
				    .enter()
				    .append("div")
				    .style("margin-bottom", "2px");

				legendRow.append("div")
				    .html("&nbsp")
				    .attr("class", "rect")
						.style("opacity", function(d, i) { if (data.nodes.length > 100 && i > MAX_LEVEL) return "0.2"; else return "1"; })
				    .style("background-color", (d, i) => color(i));

				legendRow.append("div")
				    .style("opacity", function(d, i) { if (data.nodes.length > 100 && i > MAX_LEVEL) return "0.2"; else return "1"; })
				    .html(d=> "lv. " + d);

				//This code is for reduce graph size when too big
				if (data.nodes.length > 100) {
						var nodi = [];
						var archi = [];
						for (let i = 0; i < data.nodes.length; i++) {
		            if (data.nodes[i].group < MAX_LEVEL) {
									  nodi.push(data.nodes[i])
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

				var files = [];
				data.nodes.forEach(function(node) {
						files.push(
								node.files
						);
				})

				var max_file = d3.max(files),
					circle_size = width / max_file / data.nodes.length;

				var simulation = d3.forceSimulation()
					.force("link", d3.forceLink().id(function(d) {
							return d.id;
						})
						.distance(function(d,i){
							return ( (max_file * circle_size))
						})
						.strength(0.5)
					)
					.force("charge", d3.forceManyBody())
					.force("center", d3.forceCenter(width / 2, height / 2))
					.force("collide",d3.forceCollide( (circle_size * max_file) + 5 ))

				var edges = plot.append("g")
					.attr("class", "edges")
					.selectAll("line")
					.data(data.edges)
					.enter()
					.append("line")
					.attr("class","line")
					.attr("stroke","#999")

				var nodes = plot.append("g")
					.attr("class", "nodes")
					.selectAll(".nodes")
					.data(data.nodes)
					.enter()
					.append("g")
					.attr("class",function(d,i){
						return d.id.hashCode() + " node"
					})
					.call(d3.drag()
						.on("start", dragstarted)
						.on("drag", dragged)
						.on("end", dragended)
					)

				var node_circle = nodes.append("circle")
					.attr("r", function(d,i){
						return Math.min(100, 3 + (d.files  * circle_size));
					})
					.attr("fill", function(d) {
						return  color(d.group);
					})
					.attr("class", function (d,i){
						return "circle " + d.files
					})

				simulation
					.nodes(data.nodes)
					.on("tick", ticked);

				simulation.force("link")
					.links(data.edges);

				function ticked() {
					var x = 1
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
							return "translate(" + (d.x * x) + "," + (d.y* x) + ")"
						})

					var q = d3.quadtree(nodes),
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
		})
}

function sorting_sidebar(){
	$("#desc_order").on("click", function(){
		if ($("#desc_order").hasClass("underline") ) {
			//console.log("già selezionato")
		} else {
			$("#by_name").toggleClass("underline");
			$("#desc_order").toggleClass("underline");
			$("#category_network_container").find(".circle").removeClass("selected_circle");
			sidebar("desc_order");
			$("#desc_order").css("cursor","default");
			$("#by_name").css("cursor","pointer");
		}
	})

	$("#by_name").on("click", function(){
		if ($("#by_name").hasClass("underline") ) {
      //console.log("già selezionato")
		} else {
			$("#by_name").toggleClass("underline");
			$("#desc_order").toggleClass("underline");
			$("#category_network_container").find(".circle").removeClass("selected_circle");
			sidebar("by_name");
			$("#by_name").css("cursor","default");
			$("#desc_order").css("cursor","pointer");
		}
	})
}

function sidebar(order) {

	var template_source = "/views/category-network/tpl/category-network.tpl";
	var data_source = getUrl();
	var target = "#right_sidebar_list";

	function highlight() {

		// from Sidebar to Graph
		$(".list_item").on("click", ".item" , function(){
			element = $(this).find(".id").attr("id");

			// reset Sidebar - Dataviz
			$("#right_sidebar_list .id").removeClass("selected_list_item");
			$("#category_network_container").find(".circle").removeClass("selected_circle");

			// highlight Graph
			node_selected = $("#category_network_container").find("." + element).children(".circle")
			node_selected.toggleClass("selected_circle");

			// highlight Sidebar
			selected = $(this).find(".id");
			selected.toggleClass("selected_list_item");
		});

		// from Graph to Sidebar
		$(".node").on("click", function(){
				e = $(this).attr("class");
				element = e.split(" ",1)

				// reset Sidebar - Dataviz
				$("#right_sidebar_list .id").removeClass("selected_list_item");
				$("#category_network_container").find(".circle").removeClass("selected_circle");

				// highlight Graph
				node_selected = $(this).children(".circle")
				node_selected.toggleClass("selected_circle");

				// highlight Sidebar
				selected = $("#right_sidebar_list").find("#" + element)
				selected.toggleClass("selected_list_item");
				document.getElementById(element).scrollIntoView({
				    //behavior: "smooth",
				    block: "start"
				});
				document.getElementById('topbar').scrollIntoView();
		})
	}

	$.get( template_source , function(tpl) {
		$.getJSON( data_source , function(d) {

			if (order == "desc_order"){
				d.nodes.sort( function(a,b) {
					return b.files - a.files;
				});
			}
			else if (order == "asc_order") {
				d.nodes.sort( function(a,b) {
					return a.files - b.files;
				});
			}
			if (order == "by_name"){
				d.nodes.sort( function(a,b) {
					res= a.group - b.group;
					if(res==0)
						res=b.files-a.files;
					return res;
				});
			}

			for (var i = 0; i < d.nodes.length; i++) {
				  d.nodes[i].name = d.nodes[i].id.replace(/_/g," ");
					d.nodes[i].files = nFormatter(d.nodes[i].files);
					d.nodes[i].id_encoded = d.nodes[i].id.hashCode();
			}

			var template = Handlebars.compile(tpl);
			$(target).html(template(d));

			sorting_sidebar();
			highlight();

		});
	});
}

function download() {
	$('<a href="' + getUrl() + '" download="' + "category_network.json" + '">Download dataset</a>').appendTo('#download_dataset');
}

$("#how_to_read_button").click(function(){
	$(".how_to_read").toggleClass("show");
});

$(document).ready(function(){
	dataviz();
	switch_page();
	sidebar("by_name");
	download();
	setCategory();
})
