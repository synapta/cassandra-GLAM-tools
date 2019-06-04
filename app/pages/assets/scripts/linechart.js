var FILE_QUERY
var SHOWN_SEC_LINE = false;


var lineChartDraw = function(div, query) {

  FILE_QUERY = query + "/file/";

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

  // console.log(data);

  var margin = {};
  var margin2 = {};
  var kH;
  var availH;

  if ($(window).width() < 576) {  // smartphones
    availH = $("#" + div).outerHeight();
    margin = { top: 10, right: 40, bottom: 140, left: 20 };
    margin2 = { top: availH - margin.bottom + 30, right: 40, bottom: 50, left: 20 };
  } else { // tablets and desktop
    availH = $("#" + div).outerHeight() * 0.82;
    margin = { top: 10, right: 50, bottom: 140, left: 30 };
    margin2 = { top: availH - margin.bottom + 30, right: 50, bottom: 50, left: 30 };
  }

  var width = Math.round($("#" + div).outerWidth()) - margin.left - margin.right,
      height = availH - margin.top - margin.bottom,
      height2 = availH - margin2.top - margin2.bottom;

  var parseTime = d3.isoParse;

  var image_valueline, image_path, img_data;

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
  var y = d3.scaleLog().range([height, 0]);

  // BRUSH SCALES
  var x2 = d3.scaleTime().range([0, width]);
  var y2 = d3.scaleLog().range([height2, 0]);

  // SET DOMAINS
  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([d3.min(data, function(d) { return d.views; }), d3.max(data, function(d) { return d.views; })]);

  // BRUSH DOMAINS
  x2.domain(x.domain());
  y2.domain(y.domain());

  // AXIS
  var xAxis = d3.axisBottom(x);
  var xAxis2 = d3.axisBottom(x2);

  // var yAxis = d3.axisLeft(y).ticks(20).tickFormat(d3.formatPrefix(".0", 1)).tickSize(6, 0);

  var yAxis = d3.axisLeft(y).ticks(20).tickFormat(d3.formatPrefix(".0", 1));

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
                     .curve(d3.curveLinear);

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
  var image_bisect = d3.bisector(function(d) { return d.access_date; }).left;

    // Line across the plots on mouse pointer
  var verticalLine = focus.append("g").attr("class", "hover-line");

  // MOUSE HANDLER
  // $(".zoom-area").mousemove(function(event) {
  $("#svg-graph").mousemove(function(event) {

    let mousePoint = {x: event.pageX, y: event.pageY };

    // console.log(mousePoint);

    if (isInsideGraph(mousePoint)) {
      // MOVE VERTICAL LINE
      let mouseX = mousePoint.x - margin.left * 2 - 15;
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

  // add circles for annotation
  // $("#svg-graph").on("click", function(event) {
  //
  //   let mousePoint = {x: event.pageX, y: event.pageY };
  //   let xCoord = mousePoint.x - margin.left * 2 - 15;
  //   let yCoord = y(data[bisect(data, getValueForPositionXFromData(xCoord))].views);
  //   let fT = moment(getValueForPositionXFromData(xCoord)).format("DD MMM YY, HH:mm");
  //
  //   var circle_data = {
  //     x: xCoord,
  //     y: yCoord,
  //     time: fT,
  //     text: "description"
  //   };
  //
  //   // console.log(circle_data);
  //
  //   if (isInsideGraph(mousePoint)) {
  //     addCircle(circle_data);
  //   }
  // });

  // focus.selectAll('.note-dot')


  // function addCircle(circle_data) {
  //   focus.append("circle") // Uses the enter().append() method
  //        .datum(circle_data)
  //        .attr("class", "note-dot") // Assign a class for styling
  //        .attr("cx", (d) => d.x)
  //        .attr("cy", (d) => d.y)
  //        .attr("r", 5)
  //        .style("transition", "all .5s")
  //        .on('mouseover', function(d) {
  //          console.log(d);
  //        }).on('mouseout', function(d) {
  //
  //        });
  // }

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
                .html("TOTAL VIEWS: " + views)
                .attr("font-family", "monospace")
                .attr("font-size", "14px");

    if (SHOWN_SEC_LINE) {
      let img_views = img_data[image_bisect(img_data, time)].sum;
      // show data (views)
      detailsLabel.append("text")
                  .attr("x", width - 200)
                  .attr("y", 70)
                  .attr("class", "info-label")
                  .html("IMAGE VIEWS: " + img_views)
                  .attr("font-family", "monospace")
                  .attr("font-size", "14px");
    }
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
    // console.log(point);
    if (point.x > (margin.left * 2 + 15) && point.x < (width + margin.left * 2 + 15) &&
      point.y > ($('#svg-graph').offset().top + margin.top) &&
      point.y < (height + $('#svg-graph').offset().top + margin.top)) {
      return true;
    } else {
      return false;
    }
    return true;
  }

  // zoom behavior handler
  function zoomFunction() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());
    path.attr("d", valueline);
    if (SHOWN_SEC_LINE) {
      image_path.attr("d", image_valueline);
    }
    gX.call(xAxis);
    // update dots
    let dots = focus.selectAll('.note-dot');
    // console.log(dots);
    dots.attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);

    brushView.call(brush.move, x.range().map(t.invertX, t));
  }

  function brushFunction() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    path.attr("d", valueline);
    if (SHOWN_SEC_LINE) {
      image_path.attr("d", image_valueline);
    }
    gX.call(xAxis);
    svg.select(".zoom-area")
       .call(zoom.transform, d3.zoomIdentity
       .scale(width / (s[1] - s[0]))
       .translate(-s[0], 0));
  }

  window.hideFileLine = function() {
    d3.selectAll('.image_line').remove();
    y.domain([d3.min(data, function(d) { return d.views; }), d3.max(data, function(d) { return d.views; })]);
    // update main line chart
    path.transition().attr("d", valueline);
    SHOWN_SEC_LINE = false;
  }

  window.showFileLine = function(filename) {
    d3.selectAll('.image_line').remove();
     if (filename !== undefined) {
       d3.json(FILE_QUERY + filename, function(error, image_data) {
         if (error) throw error;

         image_data.forEach(function(d) {
           d.access_date = parseTime(d.access_date);
           d.sum = +d.sum;
         });

         SHOWN_SEC_LINE = true;
         img_data = image_data;

         // update domain
         let min = Math.min(d3.min(image_data, function(d) { return d.sum; }), d3.min(data, function(d) { return d.views; }));
         let max = Math.max(d3.max(image_data, function(d) { return d.sum; }), d3.max(data, function(d) { return d.views; }));

         y.domain([min, max]);

         // update axis
         gY.call(yAxis);

         // update main line chart
         path.transition().attr("d", valueline);

         // append new line
         image_valueline = d3.line()
                           .x(function(d) { return x(d.access_date); })
                           .y(function(d) { return y(d.sum); })
                           .curve(d3.curveStepBefore);

         image_path = lineChart.append("path")
                       .datum(image_data)
                       .attr("class", "image_line")
                       .attr("d", image_valueline);

       });
     }
  }
}
