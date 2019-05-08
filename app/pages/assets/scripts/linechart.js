var lineChartDraw = function(div, query) {
    d3.json(query, function(error, data) {
        if (error) {
            console.error(error);
        };

        $(document).ready(function(){
            lineChart(div, data);
        });
    });
}

function lineChart(div, data) {

    var margin = {top: 30, right: 20, bottom: 30, left: 70},
        width = Math.round( $("#" + div).outerWidth() ) - margin.left - margin.right,
        height = $("#" + div).outerHeight()*0.8  - margin.top - margin.bottom;

    var parseTime = d3.isoParse;

    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLog().range([height, 0]);

    var svg = d3.select("#" + div).append("svg")
        .attr("id", "svg-graph")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    function make_x_gridlines() {
        return d3.axisBottom(x)
            .ticks(5)
    }

    function make_y_gridlines() {
        return d3.axisLeft(y)
            .ticks(5)
    }

    function isInsideGraph(point) {
      if (point.x > margin.left && point.x < (width + margin.left)
          && point.y > ($('#svg-graph').offset().top + margin.top)
          && point.y < (height + $('#svg-graph').offset().top + margin.top)) {
        return true;
      } else {
        return false;
      }
    }

    // format the data
    data.forEach(function(d) {
        d.date = parseTime(d.date);
        d.views = +d.views;
    });

    var valueline = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.views); })
        .curve(d3.curveStepBefore);
        // .curve(d3.curveLinear);
        // .curve(d3.curveCardinal);

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([d3.min(data, function(d) { return d.views; }), d3.max(data, function(d) { return d.views; })]);

    function getValueForPositionXFromData(xPosition) {
      var xValue = x.invert(xPosition);
      return xValue;
    }

    function getValueForPositionYFromData(yPosition) {
      var yValue = y.invert(yPosition);
      return yValue;
    }

    svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_gridlines()
            .tickSize(-height)
            .tickFormat("")
        )

    svg.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
        )

    var path = svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline);

    //  Label to display details (right top corner)
    var detailsLabel = svg.append("g").attr("class", "dateLabel");
    var bisect = d3.bisector(function(d) { return d.date; }).left;

    function displayDetails(time) {
      detailsLabel.selectAll('text').remove();
      let fT = moment(time).format("DD MMM YY, HH:mm");
      let views = data[bisect(data, time)].views;
      detailsLabel.append("text")
                  .attr("x", width - 200)
                  .attr("y", 0)
                  .attr("class", "info-label")
                  .html("DATE: " + fT)
                  .attr("font-family", "monospace")
                  .attr("font-size", "14px");

      detailsLabel.append("text")
                  .attr("x", width - 200)
                  .attr("y", 0 + 20)
                  .attr("class", "info-label")
                  .html("VIEWS: " + views)
                  .attr("font-family", "monospace")
                  .attr("font-size", "14px");

    }

    // Line across the plots on mouse pointer
    // var horizontalLine = svg.append("g").attr("class", "hover-line");
    var verticalLine = svg.append("g").attr("class", "hover-line");

    $("#svg-graph").mousemove(function(event) {
      let mousePoint = {x: event.pageX, y: event.pageY};
      if (isInsideGraph(mousePoint)) {

        // VERTICAL LINE
        let mouseX = mousePoint.x - margin.left;
        verticalLine.select('line').remove();
        verticalLine.append("line")
                      .attr("x1", mouseX).attr("x2", mouseX)
                      .attr("y1", 5).attr("y2", height - 5)
                      .style("stroke", "DarkViolet")
                      // .style("stroke-dasharray", ("5, 7"))
                      .style("stroke-width", 0.5);

        // HORIZONTAL LINE
        // let mouseY = mousePoint.y - $('#svg-graph').offset().top - margin.top;
        // horizontalLine.select('line').remove();
        // horizontalLine.append("line")
        //             .attr("x1", 5).attr("x2", width - 5)
        //             .attr("y1", mouseY).attr("y2", mouseY)
        //             .style("stroke", "DarkViolet")
        //             .style("stroke-dasharray", ("5, 7"))
        //             .style("stroke-width", 0.5);

        displayDetails(getValueForPositionXFromData(mouseX));
      } else {
        // hide lines
        verticalLine.select('line').remove();
        detailsLabel.selectAll('text').remove();
      }
    });

    // AXIS
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y)
            .ticks(2)
            .tickFormat(d3.formatPrefix(".0", 1))
        );
}
