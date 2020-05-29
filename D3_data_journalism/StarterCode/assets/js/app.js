// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]*0.9),
      d3.max(data, d => d[chosenXAxis]*1.1)
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

//Add the abbr to the circle labels
function renderLabels(circleLabels, newXScale, chosenXAxis) {

  circleLabels.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

  return circleLabels;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "Poverty";
  }
  else if (chosenXAxis === "income"){
    label = "Income";
  }
  else {
    label = "Age(Median)";
  }
//console.log(label);
//console.log(d[chosenXAxis]);

  var toolTip = d3.tip()
    // .style("display","block" )
    .attr("class", "tooltip")
    .offset([80, -60])
    //HELP To solve for the $ in the tooltip would I create an if statement here?
    .html(function(d) {
      var labelText
      if (label==="Income"){
        labelText = `<strong>${d.abbr}<strong><br>${label}: $${d[chosenXAxis]}<br>Healthcare: ${d.healthcare}`
      }
      else {
        labelText =  `<strong>${d.abbr}<strong><br>${label}: ${d[chosenXAxis]}<br>Healthcare: ${d.healthcare}`}

      return (labelText)
    });
    // .style("left", d3.event.pageX + "px")
    // .style("top", d3.event.pageY + "px");

  //circlesGroup.call(toolTip);
  svg.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
    d3.select(this).style("stroke", "black")
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
      d3.select(this).style("stroke", "pink")
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
(async function(){
  var data = await d3.csv("data.csv").catch(err => console.log(err))

  // parse data
  data.forEach(data => {
    data.poverty = +data.poverty;
    data.heathcare = +data.heathcare;
    data.age = +data.age;
    data.income = +data.income;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis)
    .domain([d3.min(data, d => d[chosenXAxis])*0.8, d3.max(data, d => d[chosenXAxis])*1.1])
    .range([0,width])
  console.log(d3.max(data, d => d[chosenXAxis]));

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
  //HELP this isn't giving me the correct max
    .domain([0, d3.max(data, d => d.healthcare)*3])
    .range([height, 0]);
  console.log(d3.max(data, d => d.healthcare));

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  console.log(chosenXAxis);

  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 20)
    .attr("fill", "pink")
    .attr("opacity", ".5");

  //Create the abbr labels inside the bubbles
  var circleLabels = chartGroup.selectAll(null)
    .data(data)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d.healthcare))
    .text(d => d.abbr)
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("text-anchor", "middle")
    .attr("fill", "white");

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age(Median)");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Healthcare");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  //var circleLabels = updateToolTip(chosenXAxis, circleLabels);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        circleLabels = renderLabels(circleLabels, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "income") {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

})()
