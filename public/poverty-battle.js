fetch('/sex_poverty')
  .then(response => response.json())
  .then(data => {
    createPovertyRateBattle(data);
  });

  function createPovertyRateBattle(data) {
    // Clear previous
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
      
      // Create a container for country name and flag
      const countryHeader = card.append('div')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('justify-content', 'center')
        .style('gap', '10px');

      // Add country flag
      countryHeader.append('img')
        .attr('src', `https://flagcdn.com/w80/${getCountryCode(point.geo)}.png`)
        .attr('width', '50')
        .attr('height', '30')
        .style('border', '1px solid #ddd')
        .on('error', function() {
          d3.select(this).style('display', 'none');
        });

      // Add country name
      countryHeader.append('h3')
        .text(point.geo)
        .style('color', '#003366');

      // Higher poverty rate knapper
      card.append('p').text(`Year: ${currentYear}`);
      card.append('p').text(`Sex: ${point.sex}`);

      card.append('button')
        .text('Higher Poverty Rate')
        .attr('class', 'answer-button')
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

    let questionAnswered = false; 

    function checkAnswer(selectedPoint, dataPoints) {
      if (questionAnswered) return; 
  
      questionAnswered = true; 
  
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
  
      // Kun muligt at trykke 'Higher Poverty Rate' en gang
      d3.selectAll('.answer-button').attr('disabled', true);
  
      nextButton.style('display', 'inline-block');
  }
  
    function nextRound() {
      questionAnswered = false; // Reset flag for new round
      d3.selectAll('.answer-button').attr('disabled', null); // Gør det muligt at trykke igen
  
      const randomDataPoints = selectRandomDataPoints();
      displayDataPoints(randomDataPoints);
      nextButton.style('display', 'none');
  }  

    nextButton.on('click', nextRound);

    // Start spillet
    nextRound();
}

function getCountryCode(countryName) {
    const countryCodeMap = {
      'Albania': 'al',
      'Austria': 'at',
      'Belgium': 'be',
      'Bulgaria': 'bg',
      'Croatia': 'hr',
      'Cyprus': 'cy',
      'Czechia': 'cz',
      'Denmark': 'dk',
      'Estonia': 'ee',
      'Finland': 'fi',
      'France': 'fr',
      'Germany': 'de',
      'Greece': 'gr',
      'Hungary': 'hu',
      'Iceland': 'is',
      'Ireland': 'ie',
      'Italy': 'it',
      'Latvia': 'lv',
      'Lithuania': 'lt',
      'Luxembourg': 'lu',
      'Malta': 'mt',
      'Montenegro': 'me',
      'Netherlands': 'nl',
      'North Macedonia': 'mk',
      'Norway': 'no',
      'Poland': 'pl',
      'Portugal': 'pt',
      'Romania': 'ro',
      'Serbia': 'rs',
      'Slovakia': 'sk',
      'Slovenia': 'si',
      'Spain': 'es',
      'Sweden': 'se',
      'Switzerland': 'ch',
      'Türkiye': 'tr',
      'United Kingdom': 'gb'
    };
    return countryCodeMap[countryName] || 'unknown';
  }
