var SHOWN_USER = {};

function dataviz() {
  d3.json(getUrlAll(), function(error, data) {
    if (error) { window.location.replace('/500'); }

    var minDate = data[0].date;
    var maxDate = data[data.length - 1].date;
    var maxValue = d3.max(data, function(d) {
      return +d.count;
    });

    d3.json(getUrl(), function(error, userData) {
      if (error)
        window.location.replace('/500');

      userData.forEach(function(d) {
        let items = d.files
        let total = 0;

        items.forEach(function(d) {
          total += +d.count
        })
        d.total = total;
      })

      userData = userData.sort(function(a, b) {
        return b.total - a.total;
      });



      barChart(data, minDate, maxDate, maxValue, "#main_contributions_container", userData);

      $("#main_contributions_container").append("<hr>")


      for (let i = 0; i < userData.length; i++) {
      	  // $("#user_contributions_container").append("<h2 style='margin-left:1.5em' id='"+ userData[i].user+ "_viz'>" + userData[i].user + "</h2>")
      		// barChart(userData[i].files, minDate, maxDate, maxValue, "#user_contributions_container");
          // console.log(userData[i].user + "  usage length: " + userData[i].files.length)
      }
    });
  });
}

function barChart(data, minDate, maxDate, maxValue, div, userData) {

  var parseDate = d3.isoParse

  let minY = minDate.substring(0, 4);
  let maxY = maxDate.substring(0, 4);

  // let displayed;
  // let user_displayed;
  let current_range;

  //TODO quite slow...
  // let tempDates = [];
  // for (var k = 0; k < data.length; k++) {
  //   tempDates[data[k].date] = true;
  // }
  //
  // for (var year = minY; year <= maxY; year++) {
  //   for (var month = 1; month <= 12; month++) {
  //     let currentDate = year + "-" + pad(month, 2);
  //     if (tempDates[currentDate] === undefined) {
  //       obj = {};
  //       obj.count = 0;
  //       obj.date = currentDate;
  //       data.push(obj);
  //     }
  //   }
  // }

	// Graph dimensions
	var margin = {};
	var margin2 = {};
	var kH;
	var availH;

	if ($(window).width() < 576) {
		// smartphones
		availH = $(div).outerHeight();
		margin = { top: 10, right: 10, bottom: 140, left: 30 };
		margin2 = { top: availH - margin.bottom + 30, right: 40, bottom: 50, left: 20 };
	} else {
		// tablets and desktop
		availH = $(div).outerHeight() * 0.9;
		margin = { top: 20, right: 30, bottom: 160, left: 50 };
		margin2 = { top: availH - margin.bottom + 50, right: 30, bottom: 10, left: 50 };
	}

	var width = Math.round($(div).outerWidth()) - margin.left - margin.right,
			height = availH - margin.top - margin.bottom,
			height2 = availH - margin2.top - margin2.bottom;

	// Format data
  data.forEach(function(d) {
    d.date = parseDate(d.date);
    d.value = +d.count;
  });
  // Format user data
  let usersMap = {};
  userData.forEach(function(user, idx) {
    usersMap[user.user] = idx;
    user.files.forEach(function(el) {
      el.date = parseDate(el.date);
      el.value = +el.count;
    });
  });
  // console.log(usersMap);

	// Sort
  data = data.sort(function(a, b) {
    return new Date(a.date) - new Date(b.date);
  });

	var nbFt = data.length;

  // Brush function
  var brush = d3.brushX()
                .extent([[0, 0], [width, height2]])
                .on("brush end", brushFunction);

  var zoom =  d3.zoom()
                .scaleExtent([1, 40])
                .translateExtent([[0, 0], [width, height]])
                .extent([[0, 0], [width, height]])
                .on("zoom", zoomFunction);

	var svg = d3.select(div)
							.append("svg")
							.attr("id", "svg-graph")
							.attr("class", "main-area")
					    .attr("width", width + margin.left + margin.right)
					    .attr("height", height + margin.top + margin.bottom); //.call(zoom);

	// SCALES
  var x = d3.scaleBand().range([0, width], .05).padding(.2);
  var y = d3.scaleLinear().range([height, 0]);

	var x2 = d3.scaleBand().range([0, width], .05).padding(.2);
  var y2 = d3.scaleLinear().range([height2, 0]);

	// SET DOMAINS
  x.domain(data.map(d => d.date));
  y.domain([0, maxValue]);
  x2.domain(x.domain());
  y2.domain(y.domain());

	// TICKS
  var tickValues;
  if ($(window).width() < 576) {
    tickValues = x.domain().filter((d, i) => { return (i % 3) === 0 });
  } else if ($(window).width() < 991) {
    tickValues = x.domain().filter((d, i) => { return (i % 2) === 0 });
  } else {
    tickValues = x.domain();
  }

	// AXIS
  var xAxis = d3.axisBottom().scale(x).tickFormat(d3.timeFormat("%Y-%m")).ticks(10);
  var xAxis2 = d3.axisBottom().scale(x2).tickFormat(d3.timeFormat("%Y-%m")).ticks(10);
  var yAxis = d3.axisLeft().scale(y).tickValues(y.ticks(3).concat(y.domain()));

	var focus = svg.append("g")
								 .attr("class", "focus")
                 .style("pointer-events", "all")
								 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                 // .call(zoom);

	var context = svg.append("g")
									 .attr("class", "context")
									 .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

	// DRAW AXIS
  var gX = focus.append("g")
						    .attr("class", "x axis")
						    .attr("transform", "translate(0," + height + ")")
						    .call(xAxis.tickValues(tickValues))
						    .selectAll("text")
						    .style("text-anchor", "end")
						    .attr("dx", "-.8em")
						    .attr("dy", "-.55em")
						    .attr("transform", "rotate(-90)");

  var gX2 = context.append("g")
  						     .attr("class", "x axis")
  						     .attr("transform", "translate(0," + height2 + ")")
  						     .call(xAxis2.tickValues(0));

  var gY = focus.append("g")
						    .attr("class", "y axis")
						    .call(yAxis)
						    .append("text")
						    .attr("transform", "rotate(-90)")
						    .attr("y", 6)
						    .attr("dy", ".71em")
						    .style("text-anchor", "end")
						    .text("Value");


	// var bars = focus.selectAll("bar")
	// 									   .data(data)
	// 									   .enter().append("rect")
	// 									   .style("fill", "#080d5a")
	// 									   .attr("x", d => x(d.date))
	// 									   .attr("width", x.bandwidth())
	// 									   .attr("y", d => y(d.value))
	// 									   .attr("height", d => height - y(d.value));

	var subBars = context.selectAll("bar")
										   .data(data)
										   .enter().append("rect")
										   .style("fill", "#080d5a")
										   .attr("x", d => x2(d.date))
										   .attr("width", x2.bandwidth())
										   .attr("y", d => y2(d.value))
										   .attr("height", d => height2 - y2(d.value));

	 // Append brush area
	 var brushView = context.append("g")
													.attr("class", "brush")
													.call(brush)
													.call(brush.move, x.range());

   var zoomView = focus.append("rect")
        .attr("class", "zoom")
        .attr("width", width)
        .attr("height", height)
        .style("pointer-events", "all")
        .call(zoom);

   zoomView.on('mousemove', function() {
      console.log('direct mouse move');
      focus.selectAll(".bar").style('opacity', '1');
      detailsLabel.selectAll('text').remove();
    });

  passThruEvents(focus.select('.zoom'));

  //  Label to display details (right top corner)
  var detailsLabel = focus.append("g").attr("class", "dateLabel");

  // display data in text box
  function displayDetails(d, name) {
    // remove previous
    detailsLabel.selectAll('text').remove();
    // format data
    let fT = moment(d.date).format("DD MMM YY, HH:mm");
    // show data (time)
    detailsLabel.append("text")
                .attr("x", width - 200)
                .attr("y", 30)
                .attr("class", "info-label")
                .html("DATE: " + fT)
                .attr("font-family", "monospace")
                .attr("font-size", "14px");
    // show data (views)
    detailsLabel.append("text")
                .attr("x", width - 200)
                .attr("y", 50)
                .attr("class", "info-label")
                .html("FILES: " + d.value + ' (' + name + ')')
                .attr("font-family", "monospace")
                .attr("font-size", "14px");
  }

  function brushFunction() {
    // Ignore brush-by-zoom
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
     // Get selection
    var s = d3.event.selection || x2.range();
    // Normalize range
    let current_range = [ Math.round(s[0] / (width / nbFt)), Math.round(s[1] / (width / nbFt)) ];
    // Set domain with data array in that range
    x.domain(data.slice(current_range[0], current_range[1]).map(ft => ft.date));
    // Update zoom behavior
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity.scale(width / (s[1] - s[0])).translate(-s[0], 0));
    // Update bars
    update();
    // Update x axis
    updateAxis();
    // Update mini bars opacity
    updateContext(current_range[0], current_range[1]);
    // If present, update user bars
    if (!isEmpty(SHOWN_USER)) {
      updateUserBars(SHOWN_USER);
    }
  }

  function zoomFunction() {
    // Ignore zoom-by-brush
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;
    // Calc range
    var t = d3.event.transform;
    var s = x.range().map(t.invertX, t);
    let current_range = [ Math.round(s[0] / (width / nbFt)), Math.round(s[1] / (width / nbFt)) ];
    // Set domain
    x.domain(data.slice(current_range[0], current_range[1]).map(ft => ft.date));
    // update brush area
    brushView.call(brush.move, s);
    // Update bars
    update();
    // Update x axis
    updateAxis();
    // Update mini bars opacity
    updateContext(current_range[0], current_range[1]);
    // If present, update user bars
    if (!isEmpty(SHOWN_USER)) {
      updateUserBars(SHOWN_USER);
    }
  }

  function update() {
    // Update bars
    let bar = focus.selectAll(".bar").data(data);
    bar.attr("x", d => x(d.date))
       .attr("width", x.bandwidth())
       .attr("y", d => y(d.value))
       .attr("height", d => height - y(d.value))
       .style("fill", "#080d5a")
       .style("transition", "opacity .3s")
       .style("display", (d) => { return (x(d.date) != null) ? 'initial' : 'none'; })
       .on("mousemove", function(d) {
         d3.select(this).style('opacity', '0.5');
         displayDetails(d, 'TOTAL')
       }).on("mouseout", function() {
         detailsLabel.selectAll('text').remove();
         d3.select(this).style('opacity', '1');
       });
    // Add
    bar.enter()
       .insert("rect", '.mean')
       .attr("class", "bar")
       .attr("x", d => x(d.date))
       .attr("width", x.bandwidth())
       .attr("y", d => y(d.value))
       .attr("height", d => height - y(d.value));
    // Remove
    bar.exit().remove();
  }

  function updateUserBars(user) {
    let user_bar = focus.selectAll(".user-bar").data(userData[user.idx].files);
    user_bar.attr("x", d => x(d.date))
       .attr("width", x.bandwidth())
       .attr("y", d => y(d.value))
       .attr("height", d => height - y(d.value))
       .style("fill", "#a68300")
       .style("transition", "fill .3s")
       .style("display", (d) => { return (x(d.date) != null) ? 'initial' : 'none'; })
       .on("mouseover", function(d) {
         d3.select(this).style('fill', 'gold');
         displayDetails(d, user.name);
       }).on("mouseout", function() {
         detailsLabel.selectAll('text').remove();
         d3.select(this).style('fill', '#a68300');
       });
    user_bar.enter()
       .insert("rect", '.mean')
       .attr("class", "user-bar")
       .attr("x", d => x(d.date))
       .attr("width", x.bandwidth())
       .attr("y", d => y(d.value))
       .attr("height", d => height - y(d.value));
    user_bar.exit().remove();
  }

  function updateAxis() {
    focus.select(".axis.x")
          .call(xAxis.tickValues(x.domain()))
          .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", "-.55em")
          .attr("transform", "rotate(-90)");
  }

  function updateContext(min, max) {
    subBars.style('fill-opacity', (_, i) => i >= min && i < max ? '1' : '0.3');
  }

  function passThruEvents(g) {

    g.on('mousemove.passThru', passThru);

    function passThru(d) {
      console.log('pass thru event');
      // get event
        var e = d3.event;
        // save pointer events stauts
        var prev = this.style.pointerEvents;
        // temporarly set none
        this.style.pointerEvents = 'none';
        // get lower layer
        var el = document.elementFromPoint(d3.event.x, d3.event.y);
        console.log(el);
        // create event
        var e2 = document.createEvent('MouseEvent');
        e2.initMouseEvent(e.type,e.bubbles,e.cancelable,e.view, e.detail,e.screenX,e.screenY,e.clientX,e.clientY,e.ctrlKey,e.altKey,e.shiftKey,e.metaKey,e.button,e.relatedTarget);
        // dispatch
        if (el !== undefined) {
          el.dispatchEvent(e2);
        }
        // Restore pointer events status
        this.style.pointerEvents = prev;
    }
  }

   window.showUserContributionsBars = function(username) {
     focus.selectAll('.user-bar').remove();
      if (username !== undefined) {
        let idx = usersMap[username];
        if (idx !== undefined) {
          SHOWN_USER.idx = idx;
          SHOWN_USER.name = username;
          focus.selectAll("bar")
               .data(userData[idx].files)
               .enter().append("rect")
               .style("fill", "#a68300")
               .attr("class", "user-bar")
               .attr("x", d => x(d.date))
               .attr("width", x.bandwidth())
               .attr("y", d => y(d.count))
               .attr("height", d => height - y(d.count))
               .style("transition", "fill .3s")
               .style("display", (d) => { return (x(d.date) != null) ? 'initial' : 'none'; })
               .on("mouseover", function(d) {
                 d3.select(this).style('fill', 'gold');
                 displayDetails(d, username);
               }).on("mouseout", function() {
                 detailsLabel.selectAll('text').remove();
                 d3.select(this).style('fill', '#a68300');
               });
        }
      }
  }

  window.hideUserContributionsBars = function() {
    focus.selectAll('.user-bar').remove();
      SHOWN_USER = {};
  }

  // showUserData();

}
