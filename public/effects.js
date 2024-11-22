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
  