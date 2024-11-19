// Fetch and draw bar chart data
fetch('/daily_median_income')
  .then(response => response.json())
  .then(data => {
    console.log(data);  // Bekræft at dataene hentes korrekt
    drawBarChart(data);
  });

 function drawBarChart(data) {
  // Vælger hvilket år data'en skal komme fra
  const filteredData = data.filter(d => d.year === 2020);

  // Filtrerer landene i stigende rækkefølge
  filteredData.sort((a, b) => a.median - b.median);

  // Clear previous chart
  d3.select('#bar-chart').selectAll('*').remove();

  const width = 900;
  const height = 500;
  const margin = { top: 20, right: 30, bottom: 90, left: 70 };

  const svg = d3.select('#bar-chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // X-axis: Countries
  const x = d3.scaleBand()
    .domain(filteredData.map(d => d.geo))
    .range([0, width - margin.left - margin.right])
    .padding(0.2);

  svg.append('g')
    .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // Y-axis: Median daily income
  const y = d3.scaleLinear()
    .domain([0, d3.max(filteredData, d => d.median)])
    .nice()
    .range([height - margin.top - margin.bottom, 0]);

  svg.append('g')
    .call(d3.axisLeft(y));

  // Add tooltips
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .style('position', 'absolute')
    .style('background', 'rgba(0, 0, 0, 0.7)')
    .style('color', '#fff')
    .style('padding', '5px 10px')
    .style('border-radius', '5px')
    .style('pointer-events', 'none');

  // Bars with tooltips
  svg.selectAll('rect')
    .data(filteredData)
    .enter()
    .append('rect')
    .attr('x', d => x(d.geo))
    .attr('y', d => y(d.median))
    .attr('width', x.bandwidth())
    .attr('height', d => height - margin.top - margin.bottom - y(d.median))
    .attr('fill', 'steelblue')
    .on('mouseover', (event, d) => {
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip.html(`<strong>${d.geo}</strong><br>Median Income pr. day: ${d.median} USD`)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mousemove', (event) => {
      tooltip.style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseout', () => {
      tooltip.transition().duration(500).style('opacity', 0);
    });

  // Labels
  svg.append("text")
    .attr("x", (width - margin.left - margin.right) / 2)
    .attr("y", height - margin.bottom + 60)
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .text("Countries");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -(height - margin.top - margin.bottom) / 2)
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .text("Median income pr. day");

  // Add source text
  svg.append('text')
    .attr('x', width - margin.left - 10)
    .attr('y', height - margin.top - 10)
    .attr('text-anchor', 'end')
    .attr('font-size', '12px')
    .attr('fill', 'grey')
    .text('Data source: Our World in Data, World Bank');
}