# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static research project website for "Skyfall-GS: Synthesizing Immersive 3D Urban Scenes from Satellite Imagery" (under review at ICLR 2026). The website showcases the first method to synthesize immersive, real-time free-flight navigable 3D urban scenes solely from multi-view satellite imagery using 3D Gaussian Splatting combined with pre-trained diffusion models.

## Architecture

- **Frontend**: Static HTML website using Bulma CSS framework
- **Assets**:
  - `static/`: Contains CSS, JavaScript, and images
  - `videos/`: Research result videos organized by dataset (comparison, free_dataset, hike_dataset, tank_dataset, teaser)
  - `thumbnails/`: Video thumbnail images
- **Interactive Components**:
  - Video comparison sliders (implemented in `static/js/video_comparison.js`)
  - Image interpolation viewer (`static/js/index.js`)
  - Bulma carousel and slider components

## Key Files

- `index.html`: Main website page with research presentation
- `static/js/video_comparison.js`: Interactive before/after video comparison functionality
- `static/js/index.js`: Image interpolation and general site interactions
- `static/css/`: Bulma framework and custom styling

## Development Commands

Since this is a static website, no build process is required. For local development:

```bash
# Serve locally (requires Python)
python3 -m http.server 8000

# Or using Node.js
npx serve .
```

## Website Structure

The site includes:
- Research paper information and authors
- Interactive video comparisons showing method results
- Dataset demonstrations across multiple scenarios
- Abstract and methodology overview
- Social media meta tags for sharing (Open Graph, Twitter Card)

## Notes

- All video content is pre-rendered and stored in the `videos/` directory
- The website uses Google Analytics (tracking ID: G-PYVRSFMDRL)
- Based on the Nerfies website template (licensed under Creative Commons Attribution-ShareAlike 4.0)