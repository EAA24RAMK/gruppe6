fetch('/sex_poverty')
  .then(response => response.json())
  .then(data => {
    const years = [2010, 2023];
    const filteredData = data.filter(d => d.year >= years[0] && d.year <= years[1]);

    // Filter for valid countries (exclude "Euro area" and "European countries")
    const uniqueCountries = [...new Set(filteredData
      .filter(d => ![
        "Euro area - 19 countries  (2015-2022)", 
        "Euro area – 20 countries (from 2023)", 
        "European Union - 27 countries (2007-2013)",
        "European Union - 27 countries (from 2020)", 
        "European Union - 28 countries (2013-2020)"].includes(d.geo))
      .map(d => d.geo))];

    // Add dropdown menu inside the line-chart section, positioned on the right side
    let controlsContainer = d3.select('#line-chart-section')
      .select('#line-chart-controls');

    if (controlsContainer.empty()) {
      controlsContainer = d3.select('#line-chart-section')
        .append('div')
        .attr('id', 'line-chart-controls')
        .style('position', 'absolute')
        .style('top', '5%') // Adjust to align with chart
        .style('right', '33%') // Positioned on the right
        .style('color', '#003366')
        .style('font-weight', 'bold')
        .style('text-align', 'center');
      
      controlsContainer.append('label')
        .text('Select country: ')
        .style('display', 'block')
        .style('margin-bottom', '5px');

      controlsContainer.append('select')
        .attr('id', 'country-selector')
        .on('change', function () {
          const selectedCountry = this.value;
          updateChart(filteredData, selectedCountry);
        });
    }

    // Populate dropdown options
    const countryDropdown = d3.select('#country-selector');
    countryDropdown.selectAll('option')
      .data(uniqueCountries)
      .enter()
      .append('option')
      .text(d => d)
      .attr('value', d => d);

    updateChart(filteredData, uniqueCountries[8]); // 8, så den viser DK først
  });

function updateChart(data, selectedCountry) {
  const europeanUnionData = data.filter(d =>
    d.geo === 'European Union - 27 countries (from 2020)' &&
    (d.sex === 'Males' || d.sex === 'Females')
  );

  const countryData = data.filter(d =>
    d.geo === selectedCountry &&
    (d.sex === 'Males' || d.sex === 'Females')
  );

  d3.select('#line-chart').selectAll('*').remove();

  const width = 900, height = 600, margin = { top: 70, right: 200, bottom: 100, left: 100 };

  const svg = d3.select('#line-chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([2010, 2023])
    .range([0, width - margin.left - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max([...europeanUnionData, ...countryData], d => +d.obs_value)])
    .nice()
    .range([height - margin.top - margin.bottom, 0]);

  const line = d3.line()
    .x(d => x(+d.year))
    .y(d => y(+d.obs_value))
    .curve(d3.curveMonotoneX);

  const plotLine = (data, color, label) => {
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line);

    svg.selectAll(`.dot-${label}`)
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(+d.year))
      .attr('cy', d => y(+d.obs_value))
      .attr('r', 4)
      .attr('fill', color)
      .on('mouseover', function (event, d) {
        tooltip.style('opacity', 1)
          .html(`Year: ${d.year}<br>Value: ${d.obs_value}`)
          .style('left', `${event.pageX + 5}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      });
  };

  // Tooltip
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('text-align', 'center')
    .style('width', 'auto')
    .style('height', 'auto')
    .style('padding', '8px')
    .style('font', '12px sans-serif')
    .style('background', 'black')
    .style('border', '0px')
    .style('border-radius', '8px')
    .style('pointer-events', 'none')
    .style('opacity', 0);

  // Plot lines
  plotLine(europeanUnionData.filter(d => d.sex === 'Males'), 'blue', 'eumales');
  plotLine(europeanUnionData.filter(d => d.sex === 'Females'), 'red', 'eufemales');
  plotLine(countryData.filter(d => d.sex === 'Males'), 'green', 'males');
  plotLine(countryData.filter(d => d.sex === 'Females'), 'orange', 'females');

  // Add axes
  svg.append('g')
    .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d')))
    .append('text')
    .attr('x', (width - margin.left - margin.right) / 2)
    .attr('y', 40)
    .attr('fill', 'black')
    .style('font-size', '16px')
    .style('text-anchor', 'middle')
    .text('Year');

  svg.append('g')
    .call(d3.axisLeft(y))
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -(height - margin.top - margin.bottom) / 2)
    .attr('y', -60)
    .attr('fill', 'black')
    .style('font-size', '16px')
    .style('text-anchor', 'middle')
    .text('Risk of Poverty Rate');

  // Add chart title
  svg.append('text')
    .attr('x', (width - margin.left - margin.right) / 2)
    .attr('y', -20)
    .attr('fill', 'black')
    .style('font-size', '20px')
    .style('font-weight', 'bold')
    .style('text-anchor', 'middle')
    .text(`${selectedCountry} compared to EU average`);

  // Add legend
  const legend = svg.append('g')
    .attr('transform', `translate(${width - margin.left - margin.right + 20}, 0)`);

  const legendData = [
    { label: 'Males: EU Total', color: 'blue' },
    { label: 'Females: EU Total', color: 'red' },
    { label: `Males: ${selectedCountry}`, color: 'green' },
    { label: `Females: ${selectedCountry}`, color: 'orange' }
  ];

  legend.selectAll('circle')
    .data(legendData)
    .enter()
    .append('circle')
    .attr('cx', 10)
    .attr('cy', (d, i) => i * 20)
    .attr('r', 6)
    .attr('fill', d => d.color);

  legend.selectAll('text')
    .data(legendData)
    .enter()
    .append('text')
    .attr('x', 25)
    .attr('y', (d, i) => i * 20 + 5)
    .text(d => d.label)
    .style('font-size', '12px')
    .attr('fill', 'black')
    .style('alignment-baseline', 'middle');

    // Add source text
  svg.append('text')
  .attr('x', width - margin.left - 10)
  .attr('y', height - margin.top - 10)
  .attr('text-anchor', 'end')
  .attr('font-size', '12px')
  .attr('fill', 'grey')
  .text('Data source: Eurostat');
}
