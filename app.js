const COUNTY_URL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const EDUCATION_URL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

Promise.all([d3.json(COUNTY_URL), d3.json(EDUCATION_URL)])
  .then((data) => callback(data[0], data[1]))
  .catch((err) => console.log(err));

function callback(countyData, educationData) {
  const svgWidth = 960;
  const svgHeight = 600;

  const mapSVG = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  const tooltip = d3
    .select("main")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

  const counties = mapSVG
    .selectAll("path")
    .data(topojson.feature(countyData, countyData.objects.counties).features)
    .enter()
    .append("path")
    .attr("d", d3.geoPath())
    .attr("class", "county")
    .attr("fill", (countyDataItem) => {
      let id = countyDataItem.id;
      let county = educationData.find((d) => {
        return d.fips === id;
      });
      let percentage = county.bachelorsOrHigher;
      if (percentage <= 15) {
        return "#b8dbd9";
      } else if (percentage <= 30) {
        return "#93afae";
      } else if (percentage <= 45) {
        return "#6e8382";
      } else {
        return "#4a5857";
      }
    })
    .attr("data-fips", (countyDataItem) => countyDataItem.id)
    .attr("data-education", (countyDataItem) => {
      let id = countyDataItem.id;
      let county = educationData.find((d) => {
        return d.fips === id;
      });
      let percentage = county.bachelorsOrHigher;
      return percentage;
    })
    .on("mouseover", (event, countyDataItem) => {
      tooltip
        .style("opacity", 0.8)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 50 + "px");

      let id = countyDataItem["id"];
      let county = educationData.find((item) => {
        return item["fips"] === id;
      });
      tooltip.attr("data-education", county.bachelorsOrHigher);

      tooltip.text(
        county.area_name +
          ", " +
          county.state +
          ": " +
          county.bachelorsOrHigher +
          "%"
      );
    })
    .on("mouseout", (countyDataItem) => {
      tooltip.style("opacity", 0);
    });

  let path = d3.geoPath();

  const stateLines = mapSVG
    .append("path")
    .datum(
      topojson.mesh(countyData, countyData.objects.states, function (a, b) {
        return a !== b;
      })
    )
    .attr("class", "states")
    .attr("d", path);
}
