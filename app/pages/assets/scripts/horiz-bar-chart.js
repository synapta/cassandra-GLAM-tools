var horizBarChartDraw = function(div, query, stats_data) {
  // get data
  d3.json(query, function(error, data) {
    console.log(query);
    // manage error
    if (error) throw error;
    // sort
    data = data.sort(function(a, b) {
      return a.usage - b.usage;
    });
    // format the data
    data.forEach(function(d) {
      d.usage = +d.usage;
    });
    // draw
    drawHorizBars(data, '#' + div, stats_data.totalPages);
    //
    // console.log('top 20 data', data);
    // console.log('stats data', stats_data);
  });
}

function drawHorizBars(data, div, totalPages) {
  // Graph dimensions
  var margin = {};
  var kH;
  var availH;

  if ($(window).width() < 576) {
    // smartphones
    availH = $(div).outerHeight();
    margin = { top: 10, right: 10, bottom: 40, left: 30 };
  } else {
    // tablets and desktop
    availH = $(div).outerHeight() * 0.85;
    margin = { top: 30, right: 20, bottom: 10, left: 70 };
  }

  var width = Math.round($(div).outerWidth()) - margin.left - margin.right,
      height = availH - margin.top - margin.bottom;

  // console.log(width, height);

  var svg = d3.select(div).append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + 50 + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // SCALES
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleBand().range([height, 0]).padding(0.3);

  var xAxis = d3.axisBottom()
                .scale(x)
                .tickFormat(d3.format(".2s"));

  var yAxis = d3.axisLeft()
                .scale(y)
                .ticks(10);

  x.domain([Math.max(0, d3.min(data, function(d) {
    return d.usage - (d3.max(data, function(d) {
      return d.usage; }) * 0.05); })), d3.max(data, function(d) { return d.usage; })]);

  y.domain(data.map(function(d) { return d.wiki; }));


  var gX = svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", ".7em")
                .attr("dy", ".7em");

  var gY = svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Value");


    // Y axis label:
  svg.append("text")
     .attr("text-anchor", "end")
     .attr("y", -15)
     .attr("x", -1)
     .text("Projects")

  svg.append("text")
     .attr("text-anchor", "end")
     .attr("x", width)
     .attr("y", height + margin.top + 10)
     .text("Pages");

  // append the rectangles for the bar chart
  var bars = svg.selectAll(".bar")
     .data(data)
     .enter().append("rect")
     .attr("class", "bar")
     .attr("data-wiki", d => d.wiki)
     .style("transition", "width 1s ease-in-out, stroke .3s")
     .attr("width", (d) => 0 )
     .attr('fill', '#080d5a')
     .attr('stroke', '#080d5a')
     .attr('stroke-width', '3')
     .attr("x", function(d) { return 3 })
     .attr("y", function(d) { return y(d.wiki); })
     .attr("height", y.bandwidth());

     setTimeout(function() {
       bars.attr("width", function(d) { return x(d.usage); } )
     }, 100);


     // bars.on('mouseover', function(d) {
     //   console.log(d);
     //   d3.select(this).attr('stroke', '#a68300');
     // }).on('mouseout', function(d) {
     //   console.log(d);
     //   d3.select(this).attr('stroke', '#080d5a');
     // });
}
