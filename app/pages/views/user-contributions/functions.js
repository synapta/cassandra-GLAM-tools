function getUrl(){
	var db=window.location.href.toString().split('/')[3];
	return "../../api/"+db+"/file/upload-date";
}
function getUrlAll(){
	var db=window.location.href.toString().split('/')[3];
	return "../../api/"+db+"/file/upload-date-all";
}

function pad (str, max) {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}

function barChart(data, minDate, maxDate, maxValue, div) {
	var	parseDate = d3.isoParse
	let minY = minDate.substring(0, 4);
	let maxY = maxDate.substring(0, 4);

  //TODO quite slow...
	let tempDates = [];
	for (var k = 0; k < data.length; k++) {
		  tempDates[data[k].date] = true;
	}
	for (var year = minY; year <= maxY; year++) {
		  for (var month = 1; month <= 12; month++) {
				  let currentDate = year+"/"+pad(month,2);

					if (tempDates[currentDate] === undefined) {
						  obj = {};
							obj.count = 0;
							obj.date = currentDate;
						  data.push(obj);
					}
			}
	}

	data.forEach(function(d) {
			d.date = parseDate(d.date.replace("/","-"));
			d.value = +d.count;
	});

	data = data.sort(function(a,b){
		return new Date(a.date) - new Date(b.date);
	});

	var margin = {top: 30, right: 30, bottom: 70, left: 50};
    width = Math.round( $("#user_contributions_container").outerWidth() ) - margin.left - margin.right,
    height = $("#main_contributions_container").outerHeight()*0.8  - margin.top - margin.bottom;

	var x = d3.scaleBand().rangeRound([0, width], .05).padding(0.1);
	var y = d3.scaleLinear().range([height, 0]);
	x.domain(data.map(function(d) { return d.date; }));
	y.domain([0, maxValue]);

	var xAxis = d3.axisBottom()
	    .scale(x)
	    .tickFormat(d3.timeFormat("%Y-%m"))
			.ticks(10);
	var yAxis = d3.axisLeft()
	    .scale(y)
	    .tickValues(y.ticks(3).concat(y.domain()));

	var tickValues = x
   .domain()
	 .filter(function(d, i) { return (i % 3) === 0 });
   //.filter(function(d, i) { return !((i + 1) % Math.floor(x.domain().length / 20)); });


	var svg = d3.select(div).append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform",
	          "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis.tickValues(tickValues))
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

function dataviz() {
	  d3.json(getUrlAll(), function(error, data) {
				if (error)
						window.location.replace('404');

				var minDate = data[0].date;
				var maxDate = data[data.length-1].date;
				var maxValue = d3.max(data, function(d) { return +d.count; });

				barChart(data, minDate, maxDate, maxValue, "#main_contributions_container");

				$("#main_contributions_container").append("<hr>")

				d3.json(getUrl(), function(error, data) {
						if (error)
								window.location.replace('404');

						data.users.forEach(function (d){
							let items = d.files
							let total = 0;

							items.forEach(function (d){
								total += +d.count
							})
							d.total = total;
						})

						data.users = data.users.sort(function(a,b){
							return b.total - a.total;
						});

						for (let i = 0; i < data.users.length; i++) {
							  $("#user_contributions_container").append("<h2 style='margin-left:1.5em' id='"+ data.users[i].user+ "_viz'>" + data.users[i].user + "</h2>")
								barChart(data.users[i].files, minDate, maxDate, maxValue, "#user_contributions_container");
						}
				});
		});
}

function sidebar(type){
		var template_source = "tpl/user-contributions.tpl";
		var target = "#sidebar";

		$.get(template_source, function(tpl) {
				$.getJSON(getUrl(), function(data) {
						data.users.forEach(function (d) {
								let total = 0;

								d.files.forEach(function (d) {
										total += +d.count
								})
								d.total = total;
						})

			      if (type === "by_num") {
								data.users = data.users.sort(function(a,b){
									return b.total - a.total;
								});
						}

						data.users.forEach(function (d) {
								d.total = nFormatter(d.total);
						})

						var template = Handlebars.compile(tpl);
						$(target).html(template(data));

						highlight()
				});
		});
}

function sorting_sidebar(){
	$("#by_num").on("click", function(){
		if ($("#by_num").hasClass("underline") ) {
			//console.log("già selezionato")
		} else {
			$("#by_name").toggleClass("underline");
			$("#by_num").toggleClass("underline");
			sidebar("by_num");
			$("#by_num").css("cursor","default");
			$("#by_name").css("cursor","pointer");
		}
	})

	$("#by_name").on("click", function(){
		if ($("#by_name").hasClass("underline") ) {
			//console.log("già selezionato")
		} else {
			$("#by_name").toggleClass("underline");
			$("#by_num").toggleClass("underline");
			sidebar("by_name");
			$("#by_name").css("cursor","default");
			$("#by_num").css("cursor","pointer");
		}
	})
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

	$('#switch_page').change(function(){
		var page = $(this).val();
		var url = home + page;

		if (url != '') {
			window.location = url;
		}
		return false;
	});
}

function highlight(){
	$(".list_item").on("click", ".item" , function(){
		var element = $(this).attr("id");

		// reset Sidebar - Dataviz
		$("#sidebar .id").removeClass("selected_list_item");

		// highlight Sidebar
		$(this).toggleClass("selected_list_item");

		// highlight Graph
		document.getElementById(element+"_viz").scrollIntoView({
				behavior: "smooth",
				block: "start"
		});
		document.getElementById('topbar').scrollIntoView();
	});
}

$(document).ready(function(){
		setCategory();
		sidebar("by_num");
		dataviz();
		how_to_read();
		download();
		switch_page();
		sorting_sidebar();
})
