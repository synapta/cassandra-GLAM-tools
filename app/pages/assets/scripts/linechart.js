var lineChartDraw = function(div, query) {
  d3.json(query, function(error, data) {
    if (error) {
      console.error(error);
    };

    $(document).ready(function() {
      lineChart(div, data);
    });
  });
}

function lineChart(div, data) {

  var margin = {};
  var margin2 = {};
  var kH;
  var availH;

  if ($(window).width() < 576) {  // smartphones
    availH = $("#" + div).outerHeight();
    margin = { top: 10, right: 40, bottom: 140, left: 20 };
    margin2 = { top: availH - margin.bottom + 30, right: 40, bottom: 50, left: 20 };
  } else { // tablets and desktop
    availH = $("#" + div).outerHeight() * 0.85;
    margin = { top: 10, right: 50, bottom: 140, left: 30 };
    margin2 = { top: availH - margin.bottom + 30, right: 50, bottom: 50, left: 30 };
  }

  var width = Math.round($("#" + div).outerWidth()) - margin.left - margin.right,
      height = availH - margin.top - margin.bottom,
      height2 = availH - margin2.top - margin2.bottom;

  var parseTime = d3.isoParse;

  // FORMAT DATA
  data.forEach(function(d) {
    d.date = parseTime(d.date);
    d.views = +d.views;
  });

  // Brush function
  var brush = d3.brushX()
                .extent([[0, 0], [width, height2]])
                .on("brush end", brushFunction);

  // Zoom Function
  var zoom = d3.zoom()
               .scaleExtent([1, 6])
               .translateExtent([[0, 0], [width, height]])
               .extent([[0, 0], [width, height]])
               .on("zoom", zoomFunction);

  // Main SVG
  var svg = d3.select("#" + div)
              .append("svg")
              .attr("id", "svg-graph")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // SCALE OBJECTS
  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  // BRUSH SCALES
  var x2 = d3.scaleTime().range([0, width]);
  var y2 = d3.scaleLinear().range([height2, 0]);

  // SET DOMAINS
  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([d3.min(data, function(d) { return d.views; }), d3.max(data, function(d) { return d.views; })]);

  // BRUSH DOMAINS
  x2.domain(x.domain());
  y2.domain(y.domain());

  // AXIS
  var xAxis = d3.axisBottom(x);
  var xAxis2 = d3.axisBottom(x2);
  var yAxis = d3.axisLeft(y).ticks(2).tickFormat(d3.formatPrefix(".0", 1));

  // Clip path (clip line outside axis)
  var clip = svg.append("defs")
                .append("svg:clipPath")
                .attr("id", "clip")
                .append("svg:rect")
                .attr("width", width)
                .attr("height", height)
                .attr("x", 0)
                .attr("y", 0);

  var lineChart = svg.append("g")
                     .attr("class", "focus")
                     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                     .attr("clip-path", "url(#clip)");

  var focus = svg.append("g")
                 .attr("class", "focus")
                 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var context = svg.append("g")
                   .attr("class", "context")
                   .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

  var valueline = d3.line()
                    .x(function(d) { return x(d.date); })
                    .y(function(d) { return y(d.views); })
                    .curve(d3.curveStepBefore);

  var valueline2 = d3.line()
                     .x(function(d) { return x2(d.date); })
                     .y(function(d) { return y2(d.views); })
                     .curve(d3.curveStepBefore);

  // GRID INSIDE THE GRAPH
  // focus.append("g")
  //      .attr("class", "grid")
  //      .attr("transform", "translate(0," + height + ")")
  //      .call(make_x_gridlines().tickSize(-height).tickFormat(""));
  //
  // focus.append("g")
  //      .attr("class", "grid")
  //      .call(make_y_gridlines().tickSize(-width).tickFormat(""));


  // DRAW AXIS
  var gX = focus.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

  var gY = focus.append("g")
                .attr("class", "axis axis--y")
                .call(yAxis);

  var gX2 = context.append("g")
                   .attr("class", "axis axis--x")
                   .attr("transform", "translate(0," + height2 + ")")
                   .call(xAxis2);

  // Append data to main graph...
  var path = lineChart.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("d", valueline);

  // ...and to secondary graph
  var path2 = context.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("d", valueline2);

  // append brush area
  var brushView = context.append("g")
                         .attr("class", "brush")
                         .call(brush)
                         .call(brush.move, x.range());

  // append zoom area
  var zoomView = svg.append("rect")
                    .attr("class", "zoom-area")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .call(zoom);


  //  Label to display details (right top corner)
  var detailsLabel = focus.append("g").attr("class", "dateLabel");
  var bisect = d3.bisector(function(d) { return d.date; }).left;

  // Line across the plots on mouse pointer
  var verticalLine = focus.append("g").attr("class", "hover-line");

  // MOUSE HANDLER
  $("#svg-graph").mousemove(function(event) {
    let mousePoint = {x: event.pageX, y: event.pageY };

    if (isInsideGraph(mousePoint)) {
      // MOVE VERTICAL LINE
      let mouseX = mousePoint.x - margin.left * 2;
      verticalLine.select('line').remove();
      verticalLine.append("line")
                  .attr("x1", mouseX).attr("x2", mouseX)
                  .attr("y1", 5).attr("y2", height - 5)
                  .style("stroke", "DarkViolet")
                  .style("stroke-width", 0.5);

      // DISPLAY DATA
      displayDetails(getValueForPositionXFromData(mouseX));
    } else {
      // HIDE LINES
      verticalLine.select('line').remove();
      detailsLabel.selectAll('text').remove();
    }
  });

  // *** FUNCTIONS ***
  // display data in text box
  function displayDetails(time) {
    // remove previous
    detailsLabel.selectAll('text').remove();
    // format data
    let fT = moment(time).format("DD MMM YY, HH:mm");
    let views = data[bisect(data, time)].views;
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
                .html("VIEWS: " + views)
                .attr("font-family", "monospace")
                .attr("font-size", "14px");
  }

  // x axis object
  function make_x_gridlines() {
    return d3.axisBottom(x).ticks(5)
  }

  // y axis object
  function make_y_gridlines() {
    return d3.axisLeft(y).ticks(5)
  }

  // invert x values
  function getValueForPositionXFromData(xPosition) {
    var xValue = x.invert(xPosition);
    return xValue;
  }

  // invert y values
  function getValueForPositionYFromData(yPosition) {
    var yValue = y.invert(yPosition);
    return yValue;
  }

  // check if point is inside graph
  function isInsideGraph(point) {
    if (point.x > margin.left * 2 && point.x < (width + margin.left * 2) &&
      point.y > ($('#svg-graph').offset().top + margin.top) &&
      point.y < (height + $('#svg-graph').offset().top + margin.top)) {
      return true;
    } else {
      return false;
    }
  }

  // zoom behavior handler
  function zoomFunction() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());
    path.attr("d", valueline);
    gX.call(xAxis);
    brushView.call(brush.move, x.range().map(t.invertX, t));
  }

  function brushFunction() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    path.attr("d", valueline);
    gX.call(xAxis);
    svg.select(".zoom-area")
       .call(zoom.transform, d3.zoomIdentity
       .scale(width / (s[1] - s[0]))
       .translate(-s[0], 0));
  }
}
