document.addEventListener('DOMContentLoaded', function() {
  const yearSelect = document.getElementById('year');
  const lineChartInfo = document.getElementById('line-chart-info');
 
 // Populate year select options
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

  // Trigger initial map load
  yearSelect.dispatchEvent(new Event('change'));
 });

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

fetch('/sex_poverty')
  .then(response => response.json())
  .then(data => {
    createPovertyRateBattle(data);
  });

  function createPovertyRateBattle(data) {
    // Clear previous content
    d3.select('#poverty-battle').selectAll('*').remove();

    const container = d3.select('#poverty-battle')
        .append('div')
        .attr('class', 'poverty-battle-container')
        .style('text-align', 'center');

    container.append('h2')
        .text('Poverty Rate Battle!')
        .style('color', '#003366');

    const scoreDisplay = container.append('p')
        .attr('id', 'score-display')
        .text('Score: 0')
        .style('font-size', '18px')
        .style('font-weight', 'bold');

    const gameArea = container.append('div')
        .attr('class', 'game-area')
        .style('display', 'flex')
        .style('justify-content', 'space-around')
        .style('margin-top', '20px');

    const country1 = gameArea.append('div').attr('class', 'country-card');
    const country2 = gameArea.append('div').attr('class', 'country-card');

    const resultDisplay = container.append('p')
        .attr('id', 'result-display')
        .style('font-size', '20px')
        .style('margin-top', '20px');

    const nextButton = container.append('button')
        .text('Next Round')
        .style('font-size', '16px')
        .style('padding', '10px 20px')
        .style('margin-top', '20px')
        .style('background-color', '#003366')
        .style('color', 'white')
        .style('border', 'none')
        .style('border-radius', '5px')
        .style('cursor', 'pointer');

    let score = 0;
    let currentYear;

    function updateScore(correct) {
        score += correct ? 1 : 0;
        scoreDisplay.text(`Score: ${score}`);
    }
    

    function selectRandomDataPoints() {
      const availableYears = [...new Set(data.map(d => d.year))];
      currentYear = availableYears[Math.floor(Math.random() * availableYears.length)];
  
      const filteredData = data.filter(d => 
          d.year === currentYear && 
          !d.geo.includes('Euro') && 
          !d.geo.includes('European Union')
      );
      const randomDataPoints = d3.shuffle(filteredData).slice(0, 2);
  
      return randomDataPoints;
  }

  function displayDataPoints(dataPoints) {
    country1.html('');
    country2.html('');

    dataPoints.forEach((point, index) => {
        const card = index === 0 ? country1 : country2;
        card.append('h3').text(point.geo)
            .style('color', '#003366');
        card.append('p').text(`Year: ${currentYear}`);
        card.append('p').text(`Sex: ${point.sex}`);
        card.append('button')
            .text('Higher Poverty Rate')
            .attr('class', 'answer-button') // Add class for easier selection
            .style('font-size', '14px')
            .style('padding', '8px 16px')
            .style('background-color', '#4CAF50')
            .style('color', 'white')
            .style('border', 'none')
            .style('border-radius', '4px')
            .style('cursor', 'pointer')
            .on('click', () => checkAnswer(point, dataPoints));
    });

    resultDisplay.text('');
}

    let questionAnswered = false; // Track if the current question has been answered

    function checkAnswer(selectedPoint, dataPoints) {
      if (questionAnswered) return; // Prevent multiple answers
  
      questionAnswered = true; // Mark the question as answered
  
      const maxPovertyRate = d3.max(dataPoints, d => +d.obs_value);
      const correct = +selectedPoint.obs_value === maxPovertyRate;
  
      updateScore(correct);
      resultDisplay.text(correct ? 'Correct!' : 'Wrong!')
          .style('color', correct ? 'green' : 'red');
  
      // Show poverty rates for both countries
      dataPoints.forEach((point, index) => {
          const card = index === 0 ? country1 : country2;
          card.append('p')
              .text(`Poverty Rate: ${point.obs_value}%`)
              .style('font-weight', 'bold')
              .style('color', +point.obs_value === maxPovertyRate ? 'green' : 'red');
      });
  
      // Disable only the answer buttons
      d3.selectAll('.answer-button').attr('disabled', true);
  
      nextButton.style('display', 'inline-block');
  }
  
    function nextRound() {
      questionAnswered = false; // Reset flag for new round
      d3.selectAll('.answer-button').attr('disabled', null); // Re-enable answer buttons
  
      const randomDataPoints = selectRandomDataPoints();
      displayDataPoints(randomDataPoints);
      nextButton.style('display', 'none');
  }  

    nextButton.on('click', nextRound);

    // Start the game
    nextRound();
}