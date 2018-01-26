function getUrl(){
	var db=window.location.href.toString().split('/')[3];
	return "../../api/"+db+"/file/upload-date";
}
function getUrlAll(){
	var db=window.location.href.toString().split('/')[3];
	return "../../api/"+db+"/file/upload-date-all";
}
function setCategory() {
	var db=window.location.href.toString().split('/')[3];
	var jsonurl= "../../api/"+db+"/rootcategory";
	$.getJSON(jsonurl, function(d) {
	$('#cat_url').text(decodeURIComponent(d.id).replace(/_/g," "));
	$("#cat_url").attr("href", "https://commons.wikimedia.org/w/index.php?title=Category:"+d.id);
	$("#cat_url").attr("title", decodeURIComponent(d.id).replace(/_/g," "));
	});
}

function barChart(data, div) {
	var margin = {top: 20, right: 20, bottom: 70, left: 40};
    width = Math.round( $("#user_contributions_container").outerWidth() ) - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

	// Parse the date / time
	var	parseDate = d3.isoParse
	var x = d3.scaleBand().rangeRound([0, width], .05).padding(0.1);
	var y = d3.scaleLinear().range([height, 0]);
	var xAxis = d3.axisBottom()
	    .scale(x)
	    .tickFormat(d3.timeFormat("%Y-%m-%d"));
	var yAxis = d3.axisLeft()
	    .scale(y)
	    .ticks(10);

	var svg = d3.select(div).append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform",
	          "translate(" + margin.left + "," + margin.top + ")");

  data.forEach(function(d) {
      d.date = parseDate(d.date.replace("/","-"));
      d.value = +d.count;
  });

  x.domain(data.map(function(d) { return d.date; }));
  y.domain([0, d3.max(data, function(d) { return d.value; })]);
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Value");
  svg.selectAll("bar")
      .data(data)
    .enter().append("rect")
      .style("fill", "steelblue")
      .attr("x", function(d) { return x(d.date); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); });
}

function dataviz(){
	  d3.json(getUrlAll(), function(error, data) {
				if (error)
						window.location.replace('404');

				barChart(data, "#user_contributions_container");

				$("#user_contributions_container").append("<br><hr><br><h2>Users</h2>")

				d3.json(getUrl(), function(error, data) {
						if (error)
								window.location.replace('404');

						data.users.forEach(function(user) {
							  $("#user_contributions_container").append("<h3>" + user.user + "</h3>")
								barChart(user.files, "#user_contributions_container");
						});
				})
		})


}

function sidebar(){
	var template_source = "tpl/user-contributions.tpl";
	var data_source = getUrl();
	var target = "#sidebar";

	$.get( template_source , function(tpl) {
		$.getJSON( data_source , function(data) {
			data.users.forEach(function (d){
				let items = d.files
				let total = 0;

				items.forEach(function (d){
					total += +d.count
				})
				d.total = total;
			})

			/*
			data.nodes.sort( function(a,b) {
				return b.total - a.total;
			});
			*/

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

	$('<a href="' + dataset_location + '" download="' + "user_contributions.json" + '">Download dataset</a>').appendTo('#download_dataset');
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
	setCategory();
	dataviz();
	how_to_read();
	sidebar();
	download();
	switch_page();
})
