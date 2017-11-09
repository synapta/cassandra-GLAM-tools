// dataviz
// ----------------------------------------
function getUrl()
{
	var db=window.location.href.toString().split('/')[3];
	return "../../api/"+db+"/file/upload-date";
}
function dataviz(){
	container = "#user_contributions_container";
	data_source = getUrl(); // user_contributions user_contributions_api
	
	//var w = window;
	var width = Math.round( $("#user_contributions_container").outerWidth() ),  // 900 
		height = Math.round( $("#user_contributions_container").outerHeight() / 3 - 10);  //Math.round(width - (width / 3));
	var margin = {top: 60, right: 60, bottom: 60, left: 60},
		nomargin_w = width - (margin.left + margin.right),
		nomargin_h = height - (margin.top + margin.bottom);
		//console.log(width + " " + height)

	d3.json(data_source, function(error, data) {
		if (error) 
			window.location.replace('404');

		users = data.users
		files = data.users[0].files
		//console.log(users)

		timespan = 12;		

		var height =  300, // ( $(container).height() / data.users.length);
			nomargin_h = height - (margin.top + margin.bottom);

		var parseTime = d3.timeParse("%Y/%m")

		users = data.users;
		test = data.users;

		users.forEach(function(user) {
			var files = user.files
			var total_files = 0
			var months = files.length

			files.forEach(function(file) {
				//console.log(file)
				
				for ( var i = 0; i < months; i++ ) { // 12 months
					total_files += file.count
					//console.log(file.count)
				}

				user.user = user.user;
				file.count = +file.count;
				file.date = parseTime(file.date);
			})
			//console.log(total_files)
			files.total = total_files;
		});
		users.sort(function(x,y){
			return d3.descending(x.files.total, y.files.total); // descending ascending
			//console.log(users[0].files.total)
		})
		console.log(users);

		test = users;
		var nested = d3.nest()
		.key(function(d) { 
			return d.user; 
		})
		.sortValues(function(a,b) { 
			return (a - b)
		})
		.entries(test);
		//console.log(test)

		var svg = d3.select(container).selectAll("svg") 
			.data(users)
			.enter()
			.append("svg")		
			.attr("width",width)
			.attr("height",height)
			.attr("viewBox", "0 0 " + width + " " + height)

		var plot = svg.append("g")
			.attr("id", "d3_plot")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

		var user = plot.append("text")
			.text(function (d,i){
				return d.user
			})
			.attr("x",10)
			.attr("y",-10)
			
		// range
		var x = d3.scaleTime()
			.rangeRound([0, nomargin_w])

		var y = d3.scaleLinear()
			.rangeRound([nomargin_h, 0]);

		var date_string = (users[0].files[users[0].files.length - 1].date).toString()
		var date_split = date_string.split(" ")
		var year = parseInt(date_split.slice(3,4))
		var month = parseInt(date_split.slice(2,3))	

		if (month == 12){
			var month = 1;
			var year = parseInt(date_split.slice(3,4) + 1);
		} 
		else {
			var my_year = year + 1;
			var my_month = month;
		}
		
		var new_date = new Date(my_year + "," + my_month);
		console.log(my_year + "," + my_month)
		console.log(new_date + 3)

		x.domain([		
			/*	
			users.map(function(file) {
				return file.files[0].date
			})
			*/
			d3.min(users, function(file) { 
				return file.files[0].date; 
			}),
			d3.max(users, function(file) { 
				return new_date // file.files[file.files.length - 1].date; 
			})
			
		]);
		//console.log(users[0].files[users[0].files.length - 1].date)
		
		var max_y = d3.max(users, function(d) {
			return d3.max(d.files, function(a) {
				return a.count; 
			})
		})
		//console.log(max_y)

		// da 0 a max
		y.domain([0,max_y]);

		
		//console.log(users[1].files[1].count)
		
		plot.append("g")
			.attr("class", "axis axis-x")
			.attr("transform", "translate(0," + (nomargin_h) + ")") // (margin.left * 4) )
			.call(d3.axisBottom(x))
			.selectAll("text")
				.attr("y", 25)
				.attr("x", 5)
				.style("text-anchor", "start")

		// y axis
		plot.append("g")
			.attr("class", "axis axis-y")
			.call(d3.axisLeft(y))

		d3.selectAll(".tick > text")
			.style("font-family", "verdana");

		
		// bars
		var bars_group = plot.append("g")
			.attr("class", function(d,i){
				return d.user + " bars"
			})
			.attr("y",0)
			.attr("x",0)
		
				
		bars_group.selectAll(".bar")
			//.data(users)
			//.data(nested[0].values)
			.data(function(d) { 
				return d.files;
			})
			.enter()
			.append("rect")
			.attr("class", function(d,i){
				return d.count + " bar"
			})
			.attr("width", function(d,i) {
				return nomargin_w / timespan
			})
			.attr("height", function(d,i) { 
				return nomargin_h - y(d.count)
			})
			.attr("y", function(d,i) { 
				return y(d.count)
			})
			.attr("x", function(d,i) { 
				return x(d.date)
			})
			.style("fill", "steelblue")
			//console.log(users[0].files + 1)
		
		/*
		var interpolation = d3.curveStepAfter; // curveLinear curveStep curveStepBefore curveStepAfter

		var starting_area = d3.area()
			.x(function(d) { return x(d.date)})
			.y0(nomargin_h)
			.y1(function(d) {return y(0);})
			.curve(interpolation)

		var area = d3.area()
			.x(function(d) { return x(d.date); })
			.y0(nomargin_h)
			.y1(function(d) {return y(d.count); })
			.curve(interpolation)
			
		var line = d3.line()
			.x(function(d) {
				return x(d.date);
			})
			.y(function(d) {
				return y(d.count); // here
			});

		// area
		var area_group = plot.append("g")
			.attr("class", function(d,i){
				return d.user + " area"
			})
			.attr("y",0)
			.attr("x",0)

		area_group.append("path")
			.attr("class", "area")
			.datum(function(d) { 
				return d.files // .files;
			})
			.attr("fill","steelblue")
			.attr("d", starting_area)
			.transition()
			.duration(400)
			.attr("d", area)
			//console.log(22)
		*/		
	})
}

function sidebar(){
	
	var template_source = "tpl/user-contributions.tpl";
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
	
	Handlebars.registerHelper('sum', function(str, a, b) {
		var args = utils.flatten([].concat.apply([], arguments));
		var i = args.length, sum = 0;
		while (i--) {
			if (!utils.isNumber(args[i])) {
				continue;
			}
			sum += (+args[i]);
		}
		return sum;
	});
	*/

	$.get( template_source , function(tpl) {
		$.getJSON( data_source , function(data) {

			var files = data.users;
			//console.log(files);

			files.forEach(function (d){
				//console.log(d.files)
				var items = d.files 

				total = 0;

				items.forEach(function (d){
					//console.log(d)
					total += d.count
				})
				//console.log(total)
			})
			

			/*
			data.nodes.sort( function(a,b) { 
				return b.files - a.files; 
			});
			*/

			/*data.nodes.forEach(function( x ) {
				console.log(x.id)
				id = x.id.replace("a"," ");
			});
			console.log(data.nodes[0])*/

			var template = Handlebars.compile(tpl); 
			$(target).html(template(data));

			//highlight()
		});
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
		$('<a href="data:' + dataset + '" download="' + "user_contributions.json" + '">Download dataset</a>').appendTo('#download_dataset');
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

$(document).ready(function(){
	dataviz();
	how_to_read();
	sidebar();
	download();
	switch_page();
})