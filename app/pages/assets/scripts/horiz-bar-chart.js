var TOP_WIKIS = [];

var horizBarChartDraw = function(div, query, stats_data) {
  // get data
  d3.json(query, function(error, data) {
    // manage error
    if (error) throw error;
    // sort
    data = data.sort(function(a, b) {
      if (a.wiki === 'others') return -1; // put others column as last element
      return a.usage - b.usage;
    });
    // format the data
    data.forEach(function(d) {
      if (d.wiki !== 'others') TOP_WIKIS.push(d.wiki);
      d.usage = +d.usage;
    });
    // draw
    drawHorizBars(data, '#' + div, stats_data.totalPages);
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
    margin = { top: 40, right: 10, bottom: 40, left: 30 };
  } else {
    // tablets and desktop
    availH = $(div).outerHeight() * 0.85;
    margin = { top: 40, right: 30, bottom: 20, left: 80 };
  }

  var width = Math.round($(div).outerWidth()) - margin.left - margin.right,
      height = availH - margin.top - margin.bottom;

  var svg = d3.select(div).append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + 50 + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // SCALES
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleBand().range([height, 0]).padding(0.3);

  x.domain([0, d3.max(data, function(d) { return d.usage; })]);

  y.domain(data.map(function(d) { return d.wiki; }));

  var xAxis = d3.axisBottom().scale(x).tickValues(x.ticks(5).concat(x.domain()));

  var yAxis = d3.axisLeft()
                .scale(y)
                .ticks(10);

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
     .attr("id", d => d.wiki)
     .style("transition", "width 1s ease-in-out, stroke .3s")
     .attr("width", (d) => 0 )
     .attr('fill', '#080d5a')
     .attr('stroke', '#080d5a')
     .attr('stroke-width', '3')
     .attr("x", function(d) { return 3 })
     .attr("y", function(d) { return y(d.wiki); })
     .attr("height", y.bandwidth());


    // add labels
  var labels = svg.selectAll('.text')
                  .data(data)
                  .enter().append("text")
                  .attr("class", "usage-bar-label")
                  .attr("x", d => x(d.usage))
                  .attr("dx", ".6em")
                  .attr("y", d => y(d.wiki) + y.bandwidth() / 2)
                  .attr("dy", ".4em")
                  .text(d => {
                    let p = d.usage / totalPages * 100;
                    return `${d.usage} (${p.toFixed(2)}%)`;
                  });

     // animation
  setTimeout(function() {
    bars.attr("width", d => x(d.usage));
  }, 100);

  // check for labels outside graph
  labels.each(function(d) {
   let bbox =  d3.select(this).node().getBBox();
   let threshold = width - margin.left;
   if (bbox.x + bbox.width > threshold) {
     d3.select(this)
       .attr("x", bbox.x - bbox.width * 1.5)
       .attr("fill", "#fff");
     }
  });

  window.highlightUsageBars = function(array) {
    array.forEach(function(el) {
      d3.select('#' + el).attr('stroke', 'red');
    });
    // check if used in other wikis
    let difference = array.filter(x => !TOP_WIKIS.includes(x));
    if (difference.length > 0) {
      d3.select('#others').attr('stroke', 'red');
    }
  }

  window.turnOffUsageBars = function(array) {
    bars.attr('stroke', '#080d5a');
  }
}
