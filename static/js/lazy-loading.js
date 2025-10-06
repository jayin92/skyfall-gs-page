// Lazy loading for videos using Intersection Observer
(function() {
    'use strict';

    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
        console.warn('Intersection Observer not supported, loading all videos immediately');
        loadAllVideos();
        return;
    }

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                loadVideo(video);
                videoObserver.unobserve(video);
            }
        });
    }, {
        // Load video when it's 50% visible or 200px from viewport
        rootMargin: '200px',
        threshold: 0.1
    });

    function loadVideo(video) {
        // Only load if not already loaded
        if (video.dataset.loaded === 'true') return;

        const src = video.dataset.src || video.getAttribute('src');
        if (src && !video.src) {
            video.src = src;
            video.dataset.loaded = 'true';

            // Add hover-to-play functionality
            addHoverControls(video);
        }
    }

    function addHoverControls(video) {
        let hoverTimeout;

        video.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                if (video.paused) {
                    video.play().catch(e => {
                        console.log('Auto-play prevented:', e);
                    });
                }
            }, 300); // Delay to prevent accidental triggers
        });

        video.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
            if (!video.paused) {
                video.pause();
            }
        });

        // Click to toggle play/pause
        video.addEventListener('click', (e) => {
            e.preventDefault();
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });
    }

    function loadAllVideos() {
        document.querySelectorAll('video[data-src]').forEach(loadVideo);
    }

    function initLazyLoading() {
        // Move src to data-src for lazy loading
        document.querySelectorAll('video[src]').forEach(video => {
            if (!video.dataset.src) {
                video.dataset.src = video.src;
                video.removeAttribute('src');
            }
            videoObserver.observe(video);
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLazyLoading);
    } else {
        initLazyLoading();
    }
})();