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

- The hero is a full-screen film. `intro.mp4` (9.9 s) is the "skyfall": six dated satellite views of JAX_214 (DFC2019 `JAX_214_008/003/023/011/001/005_RGB`, homography-registered to the tile) land one by one on a slightly askew stack, the page's input tile `stills/214-sat.webp` lands square on top and the stack fades (0.15–3.15 s), the tile holds, dissolves over 1.6 s into the 3D render of the same view (3.8–5.4 s), and the camera falls and turns into the orbit. The tile is drawn with the same affine warp throughout, so the landed card, the held tile and the dissolve meet without a jump. `hero.mp4` (20 s, 1920×1080) is the seamless 360° orbit loop. The intro's last frame equals the loop's first frame, so the script switches videos without a visible cut. The title block, nav and satellite tile appear when the orbit starts.
  - **Rendering:** Office Building scene, SuperSplat id `e3b02d34`, in headless Chrome with PlayCanvas `2.24.1` loading `https://d28zzqy0iyovbz.cloudfront.net/e3b02d34/v1/meta.json`. The scene is rotated 180° about Z, and the background is `#13171f`.
  - **Loop:** 600 frames at 1920×1620 and 30 fps. Look-at point (-1.144, -0.168, -2.284), radius 21, elevation 34°, vertical FOV 60.27°, starting azimuth 90°.
  - **Framing:** each loop frame is cropped to `1920:1080:0:540`, the bottom of the taller frame, which keeps a floater at the scene edge out of view.
  - **Descent:** 135 frames along a per-frame path. Azimuth runs from −178.8° (the satellite image's orientation, found by SIFT registration) to 90° on a Hermite curve that ends at the orbit's 0.6°/frame. Elevation runs 88°→34° and radius 75→21, both eased. The crop window eases from y=270 to y=540.
  - **Encoding:** BT.709 limited range, x264; CRF 23 for the intro, 26 for the loop.
  - **Playback:** the intro plays once per browser tab (`sessionStorage`). Replay runs it again. Scrolling or Skip goes straight to the finished hero, and readers who prefer reduced motion never get the intro; if they press Replay, the loop stays paused afterwards.
  - **Failures:** an intro that errors or has not started after 4 s is skipped, and a stalled one still reveals the title at 14 s. If `site.js` fails to load, its `onerror` removes `html.intro`, so the hero is never left blank.
  - **Hand-off:** neither video preloads (Chrome fetches over a megabyte even for `preload="metadata"`), so the intro gets the bandwidth first. Once the intro has fully downloaded, or 1.2 s before its end, the loop is switched to `preload="auto"` and loaded, which decodes its first frame without playing it. Never prime it with play() then pause(): WebKit keeps a hidden video's player running after that pause, and the loop then starts mid-orbit. `requestVideoFrameCallback` switches to it on the intro's last frame, so it continues one frame later with no freeze. Skip stays until the loop is on screen, and Replay and Pause ignore clicks for 0.8 s after it, so a double-click on Skip never pauses the loop.
  - **Reveal:** the shade and the title start 1.1 s before that switch, while the camera is still settling.
  - **Phones (≤860 px):** the film takes the top 62% of the screen and fades into the page at both edges. The fade is a `.film-fade` gradient painted over the videos in `--stage`; never put a CSS mask on a `<video>`, because iOS Safari then stops showing its frames. The title block sits below it on the page colour, and Skip, Replay and Pause sit in the film's top-right corner under the bar. The intro plays centred in the screen, and the film rises to the top as the title comes in.
  - **Captions:** two HTML captions explain the intro. "From multi-view satellite imagery" (0.4–4.4 s, under the stack) uses the teaser video's wording; "to explorable 3D urban scenes" (5.6–8.6 s, during the fall) uses the TL;DR's. `site.js` times them to the intro's frames.
- `hero.jpg` (the loop's poster) is decoded from `hero.mp4`. The share preview (`og:image`, `twitter:image`) is `og-logo.jpg`, the logo `static/images/skyfall_gs_logo.png` flattened on white at 600×600; chat apps show it in place of the favicon.
- `scenes/<id>.webp` and `<id>-thumb.webp` are the SuperSplat posters, which `site.js` loads by scene id. Scene names come from the SuperSplat titles; image counts and coordinates come from the paper's training-image tables.
- `refinement.mp4` and `compare-*.mp4` are cut from the talk video (YouTube `YRfih-lAmgU`). The stills come from the paper source's `figs/results/`.
- Production caches `/static/*` for 4 hours, so `index.html` loads `site.css`, `site.js`, `hero.*` and `intro.mp4` with a `?v=` date. Bump it whenever one of them changes, or visitors get the new page with old assets.
- The method section has two tabs, matching the method's two stages: (a) Reconstruction Stage and (b) Synthesis Stage. (c) Render Refinement is part of (b), not a third step.
  - The (b) tab follows the old method video's order. The scene for the episode sits on the left, with a "Render" arrow to (c), a before/after drag of Current 3DGS Render against Refined Render. Each tag fades once the split line passes it, so a tag only ever sits on its own picture, and the pictures cannot be dragged out as images. An "Update" arrow leads back to the scene.
  - One row of Curriculum Learning buttons (Episode 1, 2, ⋯, Nₑ, a radio group) sits above the pictures and drives the scene, its camera ring and the (c) pair together. Each button carries its ring colour: red `#e04d3b`, amber `#d0a458`, yellow `#c9c273`. At the end of the row, the poster's sentence "We progressively lower the camera elevation, …" gives the curriculum's high-to-low order; it sits in the row rather than in the bullets so the (b) tab still fits a 1440×900 screen.
  - Under (c) sits only the Text-to-Image Diffusion Model chip, which lights up while the refinement runs. From the tabs down, the (b) tab fits a 1440×900 screen. On phones each picture is followed by its own text.
  - The (a) tab shows the initial 3DGS render, the green pseudo cameras at their slide positions, and the satellite inputs as a fanned stack.
  - Each tab carries its sentences from the page's original method text.
  - The figure plays itself, as the old method video did, once it is on screen. (a) builds up for 5 s. Each episode then runs Render → refinement sweep → Update in 5 s, and the cycle loops. It plays while the figure crosses the middle 40% of the screen. Pause/Play sits beside the tab list, outside it. A click on a tab or episode, an arrow-key move, a move of the split, or keyboard focus inside the pictures hands control to the reader. Readers who prefer reduced motion start paused. The (b) pictures load as the figure comes near, so the first episode never plays over empty frames.
  - On screens wider than 860 px the two panels share one grid cell (the hidden one is `visibility: hidden`), so switching stages never moves the page. On phones (b) is most of a screen taller than (a), so after the first pass the loop stays in (b).
  - The pictures in `static/media/method/` are layers of Jay's `methods_new.pptx`, pre-cropped to the slide's `srcRect`. Slides 3–5 are episodes 1, 2 and Nₑ; `ring-1/2/3.webp` are the ring layer split by hue.
  - Ask Jay for the original assets before changing the figure's artwork.
- `static/images/skyfall_gs_logo.png` is referenced by the JSON-LD `thumbnailUrl`.

## Analytics

The page reports to Google Analytics ID `G-NM5BSS0HTY`.
