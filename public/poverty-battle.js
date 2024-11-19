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