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

    var svg = d3.select("#"+div).append("svg")
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

    // format the data
    data.forEach(function(d) {
        d.date = parseTime(d.date);
        d.views = +d.views;
    });

    var valueline = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.views); })
        .curve(d3.curveBasis);
        //.curve(d3.curveStepBefore);

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([d3.min(data, function(d) { return d.views; }), d3.max(data, function(d) { return d.views; })]);

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

    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y)
            .ticks(2)
            .tickFormat(d3.formatPrefix(".0", 1))
        );
}
