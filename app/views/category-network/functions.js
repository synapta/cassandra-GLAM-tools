// main variables
// ----------------------------------------

var w = window;
var width = 900, ///w.outerWidth,
height = Math.round(width - (width / 3));

var margin = {top: 50, right: 50, bottom: 50, left: 50},
nomargin_w = width - (margin.left + margin.right),
nomargin_h = height - (margin.top + margin.bottom);

var baseurl = document.location.href;
var h = baseurl.split("/")
var h_1 = h[h.length-2]
var home = baseurl.replace(h_1 + "/","")
function getUrl()
{
	var db=window.location.href.toString().split('/')[3];
	return "../../api/"+db+"/category";
}
function setCategory()
{
	var db=window.location.href.toString().split('/')[3];
	var jsonurl= "../../api/"+db+"/rootcategory";
	$.getJSON(jsonurl, function(d) {
	$('#cat_url').text(decodeURIComponent(d.id).replace(/_/g," "));
	$("#cat_url").attr("href", "https://commons.wikimedia.org/w/index.php?title=Category:"+d.id);
	$("#cat_url").attr("title", decodeURIComponent(d.id).replace(/_/g," "));
	});
}
// get data
// ----------------------------------------

/*function get_data(){
	var data_source = "../assets/scripts/credentials.json";
	var url = "http://cassandra.synapta.io/api/ETH/";
	var api = "category"
	var user = "";
	var pass = "";
	//var cross_origin = "https://crossorigin.me/"
	var proxy = "assets/scripts/proxy.php" + "?url=";  //cross_origin + url + api,
	var request = home + proxy + url + api;
	console.log(request);

	$.getJSON(data_source, function(data) {
		//console.log(data[0])
		var user = data[0].user;
		var pass = data[0].pass;
		
		console.log(user)

		$.ajax({ // ajax getJSON
			type: "GET",
			url: request,
			dataType: "JSON", // JSONP JSON
			//username: user,
			//password: pass,
			//jsonpCallback: "callback",
			/*data: {
				username: user, 
				password: pass
			},*/
			/*header:"Access-Control-Allow-Origin: *",
			async: true,
			success: function (data){
				var a = jQuery.parseJSON(data)
				//JSON.parse(" " + data + ""); 
				//data //parseJSON(data)
				//var newData = data;
				//a = JSON.stringify(data); // parse
				console.log(data)
				console.log(a)
			},
			error: function(x){
				console.log(x)
			}
		})
		console.log(11)	
	})
}*/

// dataviz
// ----------------------------------------

function dataviz(){

	var container = "#category_network_container";
	var data_source = getUrl();  // category_network  zurich
	
	var width = $("#category_network_container").width(), //1000, //document.getElementById("#dataviz").width,
		height = $("#category_network_container").height(); //height = 1000; 
		//console.log(width)

	var svg = d3.select(container)
		.append("svg")
		//.attr("width",width)
		//.attr("height",height)
		.attr("viewBox", "0 0 " + width + " " + height)

	var plot = svg.append("g")
		.attr("id", "d3_plot")
		//.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var parseTime = d3.timeParse("%Y/%m/%d");
	var color = d3.scaleOrdinal(d3.schemeCategory20);
	
	d3.json(data_source, function(error, data) {
		if (error) 
			window.location.replace('404');

		var files = [];
		data.nodes.forEach(function(node) {
			files.push(
				node.files
			);
		})
		
		// replace "_" with " "
		$.each(data.nodes, function(i,v) {
			v.id = v.id//.replace(/_/g," ")
			//console.log(id)
			//return id
		})

		var max_file = d3.max(files),
			node_lenght = data.nodes.length,
			circle_size = ((width / (max_file * 2)) / (node_lenght * 0.5) );
			//console.log(circle_size)

		var simulation = d3.forceSimulation()
			.force("link", d3.forceLink().id(function(d) { 
					return d.id; 
				})
				.distance(function(d,i){
					return ( (max_file * circle_size) + 20)
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
				return d.id + " node" //.replace(/_/g," ")
			})	
			.call(d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended)
			)

		var node_circle = nodes.append("circle")
			.attr("r", function(d,i){
				if (d.files == 0 || d.files == undefined ){
					return 10
				}
				else {
					if (d.files < (max_file/5) ) { //200
						return (d.files * circle_size) * 1.5 //5
					}
					else {
						return (d.files  * circle_size) * 1
					}
				}	
			})
			.attr("fill", function(d) { 
				return  color(d.group); 
			})
			.attr("class", function (d,i){
				return "circle " + d.files
			})

		/*var label = nodes.append("text")
			.attr("class", "labels")
			.text(function(d) { 
				return d.id;
			})
			.attr("text-anchor", "middle") // left
			.attr("font-family","Open Sans");*///FLAGGONE

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
				.attr("transform", function(d,i){
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

function how_to_read(){
	box = $("#how_to_read .how_to_read")
	button = $("#how_to_read > p")
	
	button.click(function(){
		//console.log("click")
		box.toggleClass("show");
	});
}

function sorting_sidebar(){
	/*
	$("#asc_order").on("click", function(){
		//console.log("asc_order");
		var button = $("#asc_order");

	
		if ($("#asc_order").hasClass("underline") ) {
			$("#asc_order").removeClass("underline");
			$("#by_name").toggleClass("underline");
			$(".list > li").removeClass("selected_list_item");
			$("#category_network_container").find(".circle").removeClass("selected_circle");
			//console.log("già selezionato")
		}
		else{
			//console.log("non selezionato")
		}
		sidebar("asc_order")
	})
	*/
	
	$("#desc_order").on("click", function(){
		//console.log("asc_order");
		//var button = $("#asc_order");

		if ($("#desc_order").hasClass("underline") ) {
			$("#desc_order").removeClass("underline");
			$("#by_name").toggleClass("underline");
			$(".list > li").removeClass("selected_list_item");
			$("#category_network_container").find(".circle").removeClass("selected_circle");
			//console.log("già selezionato")
		}
		else{
			//console.log("non selezionato")
		}
		sidebar("desc_order")
	})

	$("#by_name").on("click", function(){
		if ($("#by_name").hasClass("underline") ) {
			$("#by_name").removeClass("underline");
			$("#asc_order").toggleClass("underline");
			$("#desc_order").toggleClass("underline");
			$("#category_network_container").find(".circle").removeClass("selected_circle");
		}
		sidebar("by_name")
	})
}

function get_sidebar_data() {

	/*
	var template_source = "tpl/category-network.tpl";
	var data_source = "data/category_network.json";
	var target = "#sidebar";

	Handlebars.registerHelper('replace', function(str, a, b) {
		if (str && typeof str === 'string') {
			if (!a || typeof a !== 'string') return str;
			if (!b || typeof b !== 'string') b = '';
			return str.split(a).join(b);
		}
	});

	$.getJSON( data_source , function(d) {

		var ascending = [];
		var descending = [];

		d.nodes.sort( function(a,b) { 
			return b.files - a.files; 
		});	
		$.each(d.nodes, function(i,v){
			ascending.push(v)
		})

		d.nodes.sort( function(a,b) { 
			return a.files - b.files; 
		});	
		$.each(d.nodes, function(i,v){
			descending.push(v)
		})
		descending.push(d.nodes)

		console.log(ascending)
		console.log(descending)
	})
	*/
}

function sidebar(order) {

	var template_source = "tpl/category-network.tpl";
	var data_source = getUrl();
	var target = "#sidebar";

	/*
	Handlebars.registerHelper('replace', function(str, a, b) {
		if (str && typeof str === 'string') {
			if (!a || typeof a !== 'string') return str;
			if (!b || typeof b !== 'string') b = '';
			return str.split(a).join(b);
		}
	});
	*/

	function highlight(){

		// from Sidebar to Dataviz
		$(".list_item").on("click", ".item" , function(){
			element = $(this).find(".id").attr("id"); //.text() //.toString();
			//console.log(element);

			// reset Sidebar - Dataviz
			$("#sidebar .id").removeClass("selected_list_item"); // .list > li
			$("#category_network_container").find(".circle").removeClass("selected_circle");
			
			// highlight Dataviz
			node_selected = $("#category_network_container").find("." + element).children(".circle")
			node_selected.toggleClass("selected_circle");

			// highlight Sidebar
			selected = $(this).find(".id");
			selected.toggleClass("selected_list_item");
			//console.log("." + element)
		});

		// from Dataviz to Graph 
		$(".node").on("click", function(){
			e = $(this).attr("class");
			element = e.split(" ",1)//.toString();
			//console.log(element)
			
			// reset Sidebar - Dataviz
			$("#sidebar .id").removeClass("selected_list_item");
			$("#category_network_container").find(".circle").removeClass("selected_circle");
			
			// highlight Dataviz
			node_selected = $(this).children(".circle")
			node_selected.toggleClass("selected_circle");
			//console.log(element)
			
			// highlight Sidebar
			selected = $("#sidebar").find("#" + element)
			selected.toggleClass("selected_list_item");
			//console.log(selected)
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
			//console.log(d);

			/*
			$.each(d.nodes, function(i,v) {
				v.id = v.id.replace(/_/g," ")
			})
			//console.log(d);
			*/

			var template = Handlebars.compile(tpl); 
			$(target).html(template(d));

			sorting_sidebar();
			highlight();
			
		});
	});
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

function download(){
	var baseurl = document.location.href;
	var h = baseurl.split("/")
	var h_1 = h[h.length-2]
	var home = baseurl.replace(h_1 + "/","")
	var dataset_location = home + getUrl();

	// download json
	$.getJSON(dataset_location, function(d) {		
		var dataset = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(d));
		$('<a href="data:' + dataset + '" download="' + "category_network.json" + '">Download dataset</a>').appendTo('#download_dataset');
	})

	//svg = "<svg><text x='50' y='50'>Hello World!</text></svg>";

	// download jpeg
	function download_jpeg(){
		var dataviz = $("#category_network_container").html();
		filename = "category_network.svg"
		console.log(dataviz)


		canvg(document.getElementById('test'), svg);
	}
	//setTimeout(download_jpeg, 200);

	var exportPNG = function() {

		/*
		Based off  gustavohenke's svg2png.js
		https://gist.github.com/gustavohenke/9073132
		*/
			
		var svg = document.querySelector("svg");
		var svgData = new XMLSerializer().serializeToString(svg);

		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");

		var svgSize = svg.getBoundingClientRect();
		canvas.width = svgSize.width;
		canvas.height = svgSize.height;		
		
		var dataUri = '';
		try {
			dataUri = 'data:image/svg+xml;base64,' + btoa(svgData);
		} 
		catch (ex) {
			
			// For browsers that don't have a btoa() method, send the text off to a webservice for encoding
			/* Uncomment if needed
			$.ajax({
				url: "http://www.mysite.com/webservice/encodeString",
				data: { svg: svgData },
				type: "POST",
				async: false,
				success: function(encodedSVG) {
					dataUri = 'data:image/svg+xml;base64,' + encodedSVG;
				}
			})
			*/
		}
		
		var img = document.createElement( "img" );

		img.onload = function() {
			ctx.drawImage( img, 0, 0 );

			try {
												
				// Try to initiate a download of the image
				var a = document.createElement("a");
				a.download = "network.png";
				a.href = canvas.toDataURL("image/png");
				document.querySelector("body").appendChild(a);
				a.click();
				document.querySelector("body").removeChild(a);
												
			} catch (ex) {
		
				// If downloading not possible (as in IE due to canvas.toDataURL() security issue) 
				// then display image for saving via right-click
				
				var imgPreview = document.createElement("div");
				imgPreview.appendChild(img);
				document.querySelector("body").appendChild(imgPreview);
		
			}
		};
		img.src = dataUri;
		//console.log(dataUri);
		//console.log(img)
	}

	$("#download_dataviz").click(function () {
		// http://jsfiddle.net/chprpipr/U7PLZ/4/
		// http://piperjosh.com/2014/05/exporting-svg-graphics-png-jpg/
		exportPNG();
	})
}



		/*
		$.getJSON(dataset_location, function(d) {
			var file = d.edges;
			console.log(file);

			var file = new File(file, "category_network.json", {type: "text/plain;charset=utf-8"});
			saveAs(file);
		})
		*/
		
		//e.preventDefault();  //stop the browser from following
		//window.location.href = dataset_location;
		
		/*
		download(dataset_location, "category_network.json", "text/plain");
		console.log(dataset_location)
		*/
	//});

		/*
		var dataviz = $("#category_network_container").html();
		download(dataviz, "category_network.svg", "text/plain");
		console.log(dataviz);
		*/
		
		/*
		var getBlob = function() {
			return window.Blob || window.WebKitBlob || window.MozBlob;
		}

		var BB = getBlob();
		var dataviz = $("#category_network_container").html();
		filename = "category_network.svg"
		
		download(dataviz);
		*/
		//console.log("test")
	//})

	//var isSafari = (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1);

/*
function download(){
	$("#download").click(function () {
		
		var dataviz = $("#category_network_container").html();
		download(dataviz, "category_network.svg", "text/plain");
		console.log(dataviz);
		
		var getBlob = function() {
			return window.Blob || window.WebKitBlob || window.MozBlob;
		}

		var BB = getBlob();
		var dataviz = $("#category_network_container").html();
		filename = "category_network.svg"

		download(dataviz);
		console.log("test")

		//var isSafari = (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1);


		/*if (isSafari) {
			var img = "data:image/svg+xml;utf8," + html;
			var newWindow = window.open(img, 'download');
		}
		else {
			var blob = new BB( 
				dataviz, { type: "data:image/svg+xml" }
			);
			saveAs(blob, (element.find('input').val() || element.find('input').attr("placeholder")) + ".svg")
		}

	});
}*/

function how_to_read(){
	button = $("#how_to_read_button");
	box = $(".how_to_read");
	
	$("#how_to_read_button").click(function(){
		box.toggleClass("show");
		// console.log("click")
	});
};

$(document).ready(function(){
	//get_data();
	setCategory();//N.B. questa funzione setta il titolo categoria
	dataviz();
	switch_page();
	sidebar("desc_order");
	how_to_read();
	get_sidebar_data();
	download();
	
})
