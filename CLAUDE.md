# CLAUDE.md

Project page for **Skyfall-GS: Synthesizing Immersive 3D Urban Scenes from Satellite Imagery** (ECCV 2026, arXiv 2510.15869), served at https://skyfall-gs.jayinnn.dev/ (Cloudflare Pages; `_redirects` sends the `pages.dev` host to the custom domain).

A single static page with no framework and no build step: `index.html`, `static/css/site.css`, `static/js/site.js`, and media in `static/media/`. Preview with `python3 -m http.server 8000`.

## Page text

Every sentence on the page is copied verbatim from one of three sources: the ECCV poster (linked from the Poster button), the paper's arXiv source, or the page's own earlier wording in git history. Copy a new sentence from those sources too. The only text written for the page is control labels such as "Load the 3D scene" or "Play the teaser".

## Look

- Google Sans is the one typeface, matching the poster and talk slides.
- Dark sections use `--stage` (`#13171f`). Empty black backgrounds in clips and renders are recoloured to `--stage`; scene pixels stay untouched.
- One video moves on screen at a time. The hero loop autoplays; every other clip plays only while scrolled into view (`data-inview`), and the YouTube teaser and talk load on click.
- Changes to the design are previewed as a live before/after against the current page before they land on `main`.

## Media

- `static/media/hero.mp4` is a seamless 360° orbit of the Office Building scene (SuperSplat id `e3b02d34`). It was rendered in headless Chrome with PlayCanvas `2.24.1` loading `https://d28zzqy0iyovbz.cloudfront.net/e3b02d34/v1/meta.json`, scene rotated 180° about Z, with these settings:
  - 600 frames at 1920×920 and 30 fps.
  - Look-at point (-1.144, -0.168, -2.284), radius 21, elevation 34°, vertical FOV 36.5°, starting azimuth 90°.
  - Frames cropped to `1920:730:0:190` to drop a floater at the scene edge, then encoded as BT.709 limited range, x264 CRF 26.
  - `hero.jpg` (poster) and `og.jpg` (social card) are decoded from the encoded video.
- `refinement.mp4` and `compare-*.mp4` are cut from the talk video (YouTube `YRfih-lAmgU`). The stills come from the paper source's `figs/results/`.
- `scenes/<id>.webp` and `<id>-thumb.webp` are the SuperSplat posters, which `site.js` loads by scene id. Scene names come from the SuperSplat titles; image counts and coordinates come from the paper's training-image tables.
- `static/images/skyfall_gs_logo.png` is referenced by the JSON-LD `thumbnailUrl`.

## Analytics

The page reports to Google Analytics ID `G-NM5BSS0HTY`.
