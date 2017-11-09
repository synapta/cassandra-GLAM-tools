// main variables
// ----------------------------------------

//var w = window;
var width = Math.round( $("#page_views_container").outerWidth() ),  // 900 
	height = Math.round( $("#page_views_container").outerHeight() / 3 - 10);  //Math.round(width - (width / 3));
var margin = {top: 60, right: 60, bottom: 60, left: 60},
	nomargin_w = width - (margin.left + margin.right),
	nomargin_h = height - (margin.top + margin.bottom);
	//console.log(width + " " + height)

function dataviz(){
	container = "#page_views_container"
	data_source = "data/pageviews.json"

	d3.json(data_source, function(error, data) {
		if (error) throw error;
		//console.log(data)
		files = data.data //[0].pages[0].pageviews;
		console.log(files)

		var height =  300, //($(container).height() / files.length);
			nomargin_h = height - (margin.top + margin.bottom);

		var parseTime = d3.timeParse("%Y/%m/%d")

		files.forEach(function(file) {
			//console.log(file)
			var pages = file.pages

			pages.forEach(function(page) {
				//console.log(page.pageviews)
				var pageviews = page.pageviews

				pageviews.forEach(function(pv) {
					//console.log(pv)

					pv.date = parseTime(pv.date);
					pv.count = +pv.count;
				})
			})
		})

		var my_dataset = []

		$.each(files, function(i,v){
			//console.log(v.file)
			var pv = v.pages
			var file = v.file

			//my_file = [];
			my_date = [];

			$.each(pv, function(i,v){
				//console.log(v)
				var count = v.pageviews
				
				var total = 0
				$.each(count, function(i,v){
					
					//console.log(v)

					//console.log(v.date)
					if (1 == 1) { // v.date == "Fri Jan 01 2016 00:00:00 GMT+0100 (CET)"
						total += v.count
						
						/*
						date = [{
							total: total,
							date: parseTime(v.date)
						}]
						my_date.push({date})
						*/
					}
					else {
						//console.log(v.date)
					}

				})
				//my_dataset.push({file})
				console.log(total)
			})
		})
		console.log(my_dataset)
		

		var svg = d3.select(container).selectAll("svg") 
			.data(files)
			.enter()
			.append("svg")		
			.attr("width",width)
			.attr("height",height)
			.attr("viewBox", "0 0 " + width + " " + height)

		var plot = svg.append("g")
			.attr("id", "d3_plot")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

		var file = plot.append("text")
			.text(function (d,i){
				return d.file
			})
			.attr("x",10)
			.attr("y",-10)	

		// range
		var x = d3.scaleTime()
			.rangeRound([0, nomargin_w])

		var y = d3.scaleLinear()
			.rangeRound([nomargin_h, 0]);

		// domain
		x.domain([
			d3.min(files, function(file) { 
				return file.pages[0].pageviews[0].date //.pages[0].pageviews[0].date //file.files[0].date; 
			}),
			d3.max(files, function(file) { 
				return file.pages[0].pageviews[files[0].pages[0].pageviews.length -1].date //file //file.files[file.files.length - 1].date; 
			})
		]);

		var x_min =	d3.min(files, function(file) { 
			return file.pages[0].pageviews[0].date //.pages[0].pageviews[0].date //file.files[0].date; 
		})
		var x_max =	d3.max(files, function(file) { 
			return file.pages[0].pageviews[files[0].pages[0].pageviews.length -1].date //.pages[0].pageviews[0].date //file.files[0].date; 
		})

		var max_y = d3.max(files, function(d) {
			return d3.max(d.pages, function(a) {
				return d3.max(a.pageviews, function(b) {
					return b.count
				})
			})
		})
		//console.log(max_y)

		y.domain([0,max_y]);

		// axis
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
			//console.log(files)

		/*
		//line generator
		var line = d3.line()
			.curve(d3.curveStepBefore) // curveCatmullRom
			.x(function(d_1) {
				return x(d.date);
			})
			.y(function(d_1) { 
				return y(d.count);
			});
		
		plot.append("path")
			.data([d_1]) //  [d] datum(d) 
			.attr("class", "line") // area line
			.attr("d", line) // area line
			.attr("stroke","red")
			.attr("fill","transparent")
			.attr("stroke-width","1px")

		// axis
		plot.append("g")
			//.attr("transform","translate(0,0)")
			.call(d3.axisLeft(y))

		plot.append("g")
			//.attr("transform","translate(0,0)")
			.attr("transform", "translate(0," + (height - 100) + ")")
			.call(d3.axisBottom(x)
				//.ticks(d3.timeDay.every(30))
			)
		*/
	})
};

function how_to_read(){
	button = $("#how_to_read > p");
	box = $("#how_to_read .how_to_read");
	
	button.click(function(){
		//console.log("click")
		box.toggleClass("show");
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

function sidebar(){
	
}

$(document).ready(function(){
	dataviz();
	how_to_read();
	sidebar();
	switch_page();
})