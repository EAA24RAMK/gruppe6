document.addEventListener('DOMContentLoaded', function() {
    const yearSelect = document.getElementById('year');
   
   // Opret year select muligheder
   for (let year = 2012; year <= 2023; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
   }
   
   // Add event listener to the year select element
   yearSelect.addEventListener('change', function() {
    const year = this.value;
    fetch(`/risk_of_poverty/${year}`)
      .then(response => response.json())
      .then(data => {
        drawMap(data);
      });
   });
   
    function drawMap(data) {
      // Clear previous map
      d3.select('#map').selectAll('*').remove();
   
      // Create map visualization
      const width = 900;
      const height = 700;
   
      const svg = d3.select('#map')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
   
      // Load and display Europe
      d3.json('https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson').then(function(geojson) {
        const projection = d3.geoMercator()
          .scale(800)
          .center([20, 50])
          .translate([width / 2, height / 2]);
   
        const path = d3.geoPath().projection(projection);
   
        const colorScale = d3.scaleSequential(d3.interpolateBlues)
          .domain([0, d3.max(data, d => d.obs_value)]);
   
        svg.selectAll('path')
          .data(geojson.features)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('fill', d => {
            const country = data.find(c => c.geo === d.properties.NAME);
            return country ? colorScale(country.obs_value) : '#ccc';
          })
          .on('mouseover', function(event, d) {
            const country = data.find(c => c.geo === d.properties.NAME);
            if (country) {
              tooltip.transition()
                .duration(200)
                .style("opacity", .9);
              tooltip.html(`${d.properties.NAME}: ${country.obs_value}%`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
            }
          })
          .on('mouseout', function(d) {
            tooltip.transition()
              .duration(500)
              .style("opacity", 0);
          });
   
        // Add legend
        const legendWidth = 300;
        const legendHeight = 10;
   
        const legendSvg = svg.append('g')
          .attr('transform', `translate(20, ${height - legendHeight - 20})`);
   
        const legendScale = d3.scaleLinear()
          .domain(colorScale.domain())
          .range([0, legendWidth]);
   
        const legendAxis = d3.axisBottom(legendScale)
          .ticks(5)
          .tickFormat(d => `${d}%`);
   
        legendSvg.selectAll('rect')
          .data(d3.range(legendWidth), d => d)
          .enter()
          .append('rect')
          .attr('x', d => d)
          .attr('y', 0)
          .attr('width', 1)
          .attr('height', legendHeight)
          .attr('fill', d => colorScale(legendScale.invert(d)));
   
        legendSvg.append('g')
          .attr('transform', `translate(0, ${legendHeight})`)
          .call(legendAxis);
  
        // Add source text
        svg.append('text')
          .attr('x', width - 10)
          .attr('y', height - 10)
          .attr('text-anchor', 'end')
          .attr('font-size', '12px')
          .attr('fill', 'grey')
          .text('Data source: Eurostat');
      });
   
      // Add tooltip
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    }
  
      // Trigger initial map load
      yearSelect.dispatchEvent(new Event('change'));
    });
