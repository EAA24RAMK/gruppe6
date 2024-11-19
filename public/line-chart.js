fetch('/sex_poverty')
.then(response => response.json())
.then(data => {
  data.forEach(d => {
    console.log(`Geo: "${d.geo}", Sex: "${d.sex}"`);  // Log hver `geo` og `sex` værdi individuelt
  });
  drawLineChart(data);
});

function drawLineChart(data) {
  const filteredData = data.filter(d =>
    d.geo === 'European Union - 27 countries (from 2020)' &&
    (d.sex === 'Males' || d.sex === 'Females')
  );

  d3.select('#line-chart').selectAll('*').remove();

  const width = 900;
  const height = 600;
  const margin = { top: 50, right: 150, bottom: 70, left: 70 };

  const svg = d3.select('#line-chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain(d3.extent(filteredData, d => +d.year))
    .range([0, width - margin.left - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(filteredData, d => +d.obs_value)])
    .nice()
    .range([height - margin.top - margin.bottom, 0]);

  const line = d3.line()
    .x(d => x(+d.year))
    .y(d => y(+d.obs_value))
    .curve(d3.curveMonotoneX);

  const males = filteredData.filter(d => d.sex === 'Males');
  const females = filteredData.filter(d => d.sex === 'Females');

  svg.append('g')
    .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d')))
    .append('text')
    .attr('x', (width - margin.left - margin.right) / 2)
    .attr('y', 50)
    .attr('fill', 'black')
    .attr('text-anchor', 'middle')
    .text('Year');

  svg.append('g')
    .call(d3.axisLeft(y))
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -(height - margin.top - margin.bottom) / 2)
    .attr('y', -50)
    .attr('fill', 'black')
    .attr('text-anchor', 'middle')
    .text('Poverty Rate (%)');

  svg.append('path')
    .datum(males)
    .attr('fill', 'none')
    .attr('stroke', 'blue')
    .attr('stroke-width', 2)
    .attr('d', line);

  svg.append('path')
    .datum(females)
    .attr('fill', 'none')
    .attr('stroke', 'red')
    .attr('stroke-width', 2)
    .attr('d', line);

  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  svg.selectAll('.dot-males')
    .data(males)
    .enter()
    .append('circle')
    .attr('cx', d => x(+d.year))
    .attr('cy', d => y(+d.obs_value))
    .attr('r', 4)
    .attr('fill', 'blue')
    .on('mouseover', (event, d) => {
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip.html(`Year: ${d.year}<br>Poverty Rate: ${d.obs_value}%`)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseout', () => tooltip.transition().duration(500).style('opacity', 0));

  svg.selectAll('.dot-females')
    .data(females)
    .enter()
    .append('circle')
    .attr('cx', d => x(+d.year))
    .attr('cy', d => y(+d.obs_value))
    .attr('r', 4)
    .attr('fill', 'red')
    .on('mouseover', (event, d) => {
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip.html(`Year: ${d.year}<br>Poverty Rate: ${d.obs_value}%`)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseout', () => tooltip.transition().duration(500).style('opacity', 0));

  // Add legend
  const legend = svg.append('g')
    .attr('transform', `translate(${width - margin.right}, 20)`);

  legend.append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 5)
    .attr('fill', 'blue');

  legend.append('text')
    .attr('x', 10)
    .attr('y', 5)
    .text('Males')
    .attr('font-size', '12px')
    .attr('alignment-baseline', 'middle');

  legend.append('circle')
    .attr('cx', 0)
    .attr('cy', 20)
    .attr('r', 5)
    .attr('fill', 'red');

  legend.append('text')
    .attr('x', 10)
    .attr('y', 25)
    .text('Females')
    .attr('font-size', '12px')
    .attr('alignment-baseline', 'middle');

  // Add a title
  svg.append('text')
    .attr('x', (width - margin.left - margin.right) / 2)
    .attr('y', -20)
    .attr('text-anchor', 'middle')
    .attr('font-size', '16px')
    .attr('fill', 'black')
    .text('Poverty Rate Over Time by Sex');

  // Add source text
  svg.append('text')
    .attr('x', width - margin.left - 10)
    .attr('y', height - margin.top - 10)
    .attr('text-anchor', 'end')
    .attr('font-size', '12px')
    .attr('fill', 'grey')
    .text('Data source: Eurostat');
}  