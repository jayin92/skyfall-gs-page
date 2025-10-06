document.addEventListener('DOMContentLoaded', function() {
  // Initialize carousel
  const carousel = document.getElementById('LongSplatReconResults');
  const items = carousel.querySelectorAll('.carousel-item');
  const indicators = carousel.querySelectorAll('.carousel-indicators button');
  const prevButton = carousel.querySelector('.carousel-control-prev');
  const nextButton = carousel.querySelector('.carousel-control-next');
  
  let currentIndex = 0;
  let isAnimating = false;
  
  // Function to handle slide transition
  function slide(from, to, direction) {
    if (isAnimating) return;
    isAnimating = true;
    
    const fromItem = items[from];
    const toItem = items[to];
    
    // Update indicators
    indicators.forEach(indicator => indicator.classList.remove('active'));
    indicators[to].classList.add('active');
    
    // Set initial states
    if (direction === 'next') {
      toItem.classList.add('carousel-item-next');
    } else {
      toItem.classList.add('carousel-item-prev');
    }
    
    // Force reflow
    toItem.offsetHeight;
    
    // Start transition
    fromItem.classList.add(direction === 'next' ? 'carousel-item-start' : 'carousel-item-end');
    toItem.classList.add(direction === 'next' ? 'carousel-item-start' : 'carousel-item-end');
    
    // Wait for transition to complete
    const onTransitionEnd = () => {
      fromItem.classList.remove('active', 'carousel-item-start', 'carousel-item-end');
      toItem.classList.remove('carousel-item-next', 'carousel-item-prev', 'carousel-item-start', 'carousel-item-end');
      toItem.classList.add('active');
      
      currentIndex = to;
      isAnimating = false;
      
      toItem.removeEventListener('transitionend', onTransitionEnd);
    };
    
    toItem.addEventListener('transitionend', onTransitionEnd);
  }
  
  // Function to show next slide
  function nextSlide() {
    const nextIndex = (currentIndex + 1) % items.length;
    slide(currentIndex, nextIndex, 'next');
  }
  
  // Function to show previous slide
  function prevSlide() {
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    slide(currentIndex, prevIndex, 'prev');
  }
  
  // Function to show specific slide
  function showSlide(index) {
    if (index === currentIndex) return;
    slide(currentIndex, index, index > currentIndex ? 'next' : 'prev');
  }
  
  // Add click event listeners to indicators
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      showSlide(index);
    });
  });
  
  // Add click event listeners to navigation buttons
  prevButton.addEventListener('click', prevSlide);
  nextButton.addEventListener('click', nextSlide);
  
  /* // Removed: Autoplay functions
  // Function to reset autoplay interval
  function resetInterval() {
    if (intervalId) {
      clearInterval(intervalId);
    }
    startAutoplay();
  }
  
  // Function to start autoplay
  function startAutoplay() {
    intervalId = setInterval(nextSlide, 5000); // Change slide every 5 seconds
  }
  
  // Start autoplay
  startAutoplay();
  
  // Pause autoplay on hover
  carousel.addEventListener('mouseenter', () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });
  
  // Resume autoplay when mouse leaves
  carousel.addEventListener('mouseleave', () => {
    startAutoplay();
  });
  */
}); 