document.querySelectorAll('a.nav-button').forEach(button => {
    button.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent default anchor behavior
      const targetId = this.getAttribute('href'); // Get the href of the clicked button
      const targetElement = document.querySelector(targetId); // Select the target element
  
      if (targetElement) {
        // Smooth scroll to the target section
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });
  
// Opret back to top knap
const backToTopButton = document.createElement('button');
backToTopButton.innerHTML = '↑ Top'; // Tilføjer pil og tekst
backToTopButton.style.position = 'fixed';
backToTopButton.style.bottom = '12px';
backToTopButton.style.right = '2px';
backToTopButton.style.backgroundColor = '#003366';
backToTopButton.style.color = 'white';
backToTopButton.style.border = 'none';
backToTopButton.style.borderRadius = '10px';  
backToTopButton.style.padding = '10px 15px';  
backToTopButton.style.fontSize = '14px';
backToTopButton.style.fontWeight = 'bold'; 
backToTopButton.style.cursor = 'pointer';
backToTopButton.style.display = 'none'; // Skjul som standard
backToTopButton.style.zIndex = '1000'; 

// Tilføj knappen til dokumentet
document.body.appendChild(backToTopButton);

// Vis/skjul knappen afhængigt af scroll-position
window.addEventListener('scroll', () => {
  if (window.scrollY > 200) {
    backToTopButton.style.display = 'block';
  } else {
    backToTopButton.style.display = 'none';
  }
});

// Scroll til toppen, når der klikkes
backToTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
