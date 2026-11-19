// Skyfall-GS project page behaviour. No dependencies.
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- hero: the skyfall intro, then the orbit loop and the title ----
  var root = document.documentElement;
  var hero = document.getElementById("hero");
  var film = document.getElementById("film");
  var intro = document.getElementById("film-intro");
  var filmToggle = document.getElementById("film-toggle");
  var filmSkip = document.getElementById("film-skip");
  var filmReplay = document.getElementById("film-replay");

  if (hero && film && intro) {
    var REVEAL_LEAD = 1.1;      // the title starts this many seconds before the descent settles into the orbit
    // caption beats, in seconds of the intro: the satellite tile, then the fall into the city
    // (intro: views stack 0.15-3.15 s, dissolve 3.8-5.4 s, fall 5.4-9.9 s)
    var BEATS = [["1", 0.4, 4.4], ["2", 5.6, 8.6]];

    var setBeat = function (time) {
      var beat = "";
      BEATS.forEach(function (b) {
        if (time >= b[1] && time < b[2]) {
          beat = b[0];
        }
      });
      if (hero.dataset.beat !== beat) {
        hero.dataset.beat = beat;
      }
    };
    var revealed = false;
    var orbiting = false;
    var active = film;
    var frameCallbacks = "requestVideoFrameCallback" in HTMLVideoElement.prototype;

    var syncToggle = function () {
      filmToggle.textContent = active.paused ? "Play" : "Pause";
    };

    // The intro's last frame is the loop's first frame. The loop is shown only once its own first frame
    // is on screen, and the intro holds its last frame until then, so the hand-off has no cut and no blank.
    var startOrbit = function () {
      if (orbiting) {
        return;
      }
      orbiting = true;
      active = film;
      var shown = function () {
        hero.classList.add("is-orbit");
      };
      if (frameCallbacks) {
        film.requestVideoFrameCallback(shown);
      }
      film.play().then(frameCallbacks ? null : shown, shown);
      syncToggle();
    };

    var reveal = function () {
      if (revealed) {
        return;
      }
      revealed = true;
      hero.dataset.beat = "";
      root.classList.add("revealed");
      try {
        sessionStorage.setItem("skyfall-intro", "seen");
      } catch (e) {}
    };

    var ignoreScrollUntil = 0;
    var onScroll = function () {
      if (window.scrollY > 40 && performance.now() > ignoreScrollUntil) {
        skip();
      }
    };

    var skip = function () {
      window.removeEventListener("scroll", onScroll);
      intro.pause();
      startOrbit();
      reveal();
    };

    // Reading or scrolling during the intro is a request for the page, not the show.
    var listenForSkip = function () {
      ["wheel", "touchmove", "keydown"].forEach(function (type) {
        window.addEventListener(type, function () {
          if (!orbiting) {
            skip();
          }
        }, { once: true, passive: true });
      });
      window.addEventListener("scroll", onScroll, { passive: true });
    };

    // Decode the loop's first frame early, so starting it later takes a single frame.
    var primeLoop = function () {
      film.currentTime = 0;
      film.play().then(function () {
        if (!orbiting) {
          film.pause();
          film.currentTime = 0;
        }
      }, function () {});
    };

    // Watch the intro frame by frame: bring in the title as the camera settles, hand over on the last frame.
    var watchIntro = function () {
      if (!frameCallbacks) {
        return;
      }
      var onFrame = function (now, meta) {
        if (orbiting) {
          return;
        }
        setBeat(meta.mediaTime);
        var left = intro.duration - meta.mediaTime;
        if (left <= REVEAL_LEAD) {
          reveal();
        }
        if (left <= 1.5 / 30) {
          startOrbit();
          return;
        }
        intro.requestVideoFrameCallback(onFrame);
      };
      intro.requestVideoFrameCallback(onFrame);
    };

    var playIntro = function () {
      revealed = false;
      orbiting = false;
      root.classList.add("intro");
      root.classList.remove("revealed");
      hero.classList.remove("is-orbit");
      film.pause();
      active = intro;
      intro.currentTime = 0;
      // if the intro cannot play (autoplay blocked, data saver), go straight to the finished hero
      intro.play().then(function () {
        setTimeout(primeLoop, 800);
      }, skip);
      watchIntro();
      // browsers without frame callbacks: reveal on the clock, hand over when the intro ends
      if (!frameCallbacks) {
        var onTime = function () {
          setBeat(intro.currentTime);
          if (intro.duration - intro.currentTime <= REVEAL_LEAD) {
            reveal();
            intro.removeEventListener("timeupdate", onTime);
          }
        };
        intro.addEventListener("timeupdate", onTime);
      }
    };

    intro.addEventListener("ended", function () {
      startOrbit();
      reveal();
    });
    filmSkip.addEventListener("click", skip);

    filmToggle.addEventListener("click", function () {
      if (active.paused) {
        active.play();
      } else {
        active.pause();
      }
    });
    [film, intro].forEach(function (video) {
      video.addEventListener("play", syncToggle);
      video.addEventListener("pause", syncToggle);
    });

    // Replay runs the skyfall again from the satellite image.
    filmReplay.addEventListener("click", function () {
      // jump to the top at once (the page otherwise scrolls smoothly) and let that jump settle,
      // so it is not read as the reader scrolling away
      ignoreScrollUntil = performance.now() + 700;
      window.scrollTo({ top: 0, behavior: "instant" });
      playIntro();
      listenForSkip();
      filmSkip.focus({ preventScroll: true });
      // a reader who scrolled away during that moment still gets the page
      setTimeout(function () {
        if (!orbiting) {
          onScroll();
        }
      }, 750);
    });

    if (root.classList.contains("intro")) {
      playIntro();
      listenForSkip();
    } else if (!reduceMotion) {
      film.play().catch(function () {});
    }
    syncToggle();
  }

  // ---- clips further down play only while they are on screen ----
  var clips = document.querySelectorAll("video[data-inview]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var video = entry.target;
          if (entry.isIntersecting) {
            video.dataset.onscreen = "1";
            video.play().catch(function () {});
          } else {
            delete video.dataset.onscreen;
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );
    clips.forEach(function (video) {
      observer.observe(video);
    });
  }

  // ---- method: the two stage tabs ----
  var pipeline = document.getElementById("pipeline");
  if (pipeline) {
    var tabs = Array.prototype.slice.call(pipeline.querySelectorAll(".sf-tab"));
    var panels = tabs.map(function (tab) {
      return document.getElementById(tab.getAttribute("aria-controls"));
    });
    var episodeButtons = Array.prototype.slice.call(pipeline.querySelectorAll(".sf-episode-set [data-episode]"));
    var before = pipeline.querySelector(".sf-ba");
    var beforeRange = pipeline.querySelector(".sf-ba-range");

    function selectTab(index, focus) {
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
      });
      if (focus) {
        tabs[index].focus();
      }
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        selectTab(i, false);
      });
      tab.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowRight") next = (i + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next !== null) {
          event.preventDefault();
          selectTab(next, true);
        }
      });
    });
    selectTab(0, false);

    // One episode drives the whole loop: the scene and its ring in (b) and the render pair in (c).
    function setEpisode(state) {
      pipeline.dataset.episode = state;
      episodeButtons.forEach(function (button) {
        var on = button.dataset.episode === state;
        button.setAttribute("aria-checked", String(on));
        button.tabIndex = on ? 0 : -1;
      });
    }

    // the episode buttons are a radio group: click one, or move along them with the arrow keys
    episodeButtons.forEach(function (button, i) {
      button.addEventListener("click", function () {
        setEpisode(button.dataset.episode);
      });
      button.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = Math.min(i + 1, episodeButtons.length - 1);
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = Math.max(i - 1, 0);
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = episodeButtons.length - 1;
        if (next !== null) {
          event.preventDefault();
          setEpisode(episodeButtons[next].dataset.episode);
          episodeButtons[next].focus();
        }
      });
    });

    // (c): drag anywhere on the picture, or use the arrow keys, to move the split.
    beforeRange.addEventListener("input", function () {
      before.style.setProperty("--pos", beforeRange.value + "%");
    });

    // ---- autoplay: walks through the method the way the method video did, until the reader takes over ----
    // (a) builds up for 5 s; then each episode runs Render -> refinement sweep -> Update in 5 s; then it starts over.
    var playButton = document.getElementById("sf-play");
    var playText = playButton.querySelector(".sf-play-text");
    var panelA = document.getElementById("sf-panel-a");
    var SEGMENTS = [
      { tab: 0, start: 0, end: 5 },
      { tab: 1, episode: "ep1", start: 5, end: 10 },
      { tab: 1, episode: "ep2", start: 10, end: 15 },
      { tab: 1, episode: "ep3", start: 15, end: 20 }
    ];
    var TAB_SPAN = [[0, 5], [5, 20]];
    var CYCLE = 20;
    var clock = 0;
    var playing = false;
    var inView = false;
    var lastFrame = 0;
    var current = -1;
    var raf = 0;

    function easeInOut(x) {
      return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    }

    function setSplit(value) {
      before.style.setProperty("--pos", value + "%");
      beforeRange.value = value;
    }

    function enterSegment(index) {
      var segment = SEGMENTS[index];
      selectTab(segment.tab, false);
      tabs.forEach(function (tab) {
        tab.style.setProperty("--progress", 0);
      });
      if (segment.episode) {
        setEpisode(segment.episode);
        setSplit(100);
      } else {
        // replay the (a) build-up
        panelA.classList.remove("is-building");
        void panelA.offsetWidth;
        panelA.classList.add("is-building");
      }
    }

    function tick(now) {
      raf = 0;
      if (!playing || !inView || document.hidden) {
        lastFrame = 0;
        return;
      }
      if (lastFrame) {
        clock = (clock + (now - lastFrame) / 1000) % CYCLE;
      }
      lastFrame = now;
      var index = 0;
      while (index < SEGMENTS.length - 1 && clock >= SEGMENTS[index].end) {
        index++;
      }
      if (index !== current) {
        current = index;
        enterSegment(index);
      }
      var segment = SEGMENTS[index];
      var span = TAB_SPAN[segment.tab];
      tabs[segment.tab].style.setProperty("--progress", ((clock - span[0]) / (span[1] - span[0])).toFixed(4));
      var phase = "";
      if (segment.episode) {
        var t = clock - segment.start;
        if (t < 0.9) {
          phase = "render";
        } else if (t < 2.9) {
          phase = "refine";
          setSplit((100 - 100 * easeInOut(Math.min(1, (t - 0.9) / 1.8))).toFixed(1));
        } else if (t < 3.9) {
          phase = "update";
          setSplit(0);
        }
      }
      if (pipeline.dataset.phase !== phase) {
        pipeline.dataset.phase = phase;
      }
      raf = requestAnimationFrame(tick);
    }

    function run() {
      if (!raf && playing && inView && !document.hidden) {
        raf = requestAnimationFrame(tick);
      }
    }

    function setPlaying(on) {
      playing = on;
      pipeline.classList.toggle("is-playing", on);
      playButton.setAttribute("aria-pressed", String(on));
      playText.textContent = on ? "Pause" : "Play";
      if (!on) {
        pipeline.dataset.phase = "";
        lastFrame = 0;
      }
      run();
    }

    // Play resumes from the start of whatever the reader is looking at.
    playButton.addEventListener("click", function () {
      if (playing) {
        setPlaying(false);
        return;
      }
      clock = tabs[0].getAttribute("aria-selected") === "true" ? 0 : 5 + (Number(pipeline.dataset.episode.slice(2)) - 1) * 5;
      current = -1;
      setPlaying(true);
    });

    // Any hands-on use hands control to the reader.
    function takeOver() {
      if (playing) {
        setPlaying(false);
      }
    }
    tabs.forEach(function (tab) {
      tab.addEventListener("click", takeOver);
      tab.addEventListener("keydown", takeOver);
    });
    ["pointerdown", "keydown", "input"].forEach(function (type) {
      beforeRange.addEventListener(type, takeOver);
    });
    episodeButtons.forEach(function (button) {
      button.addEventListener("click", takeOver);
      button.addEventListener("keydown", takeOver);
    });

    // Play only while the figure is on screen and the page is visible.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (!inView) {
          lastFrame = 0;
        }
        run();
      }, { threshold: 0.35 }).observe(pipeline);
    } else {
      inView = true;
    }
    document.addEventListener("visibilitychange", run);

    // Readers who prefer reduced motion start paused and can press Play.
    setPlaying(!reduceMotion);
  }

  // ---- baseline comparisons: one clip at a time, the next takes over when it ends ----
  var versus = document.getElementById("versus-video");
  var versusCaption = document.getElementById("versus-caption");
  var versusTabs = Array.prototype.slice.call(document.querySelectorAll(".versus-tab"));

  function showComparison(tab, play) {
    versusTabs.forEach(function (other) {
      other.setAttribute("aria-pressed", String(other === tab));
    });
    versus.poster = tab.dataset.poster;
    versus.src = tab.dataset.src;
    versus.dataset.fit = tab.dataset.fit;
    versus.setAttribute("aria-label", tab.dataset.label);
    versusCaption.textContent = tab.dataset.caption;
    if (play) {
      versus.play().catch(function () {});
    }
  }

  if (versus && versusTabs.length) {
    versusTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        if (tab.getAttribute("aria-pressed") !== "true") {
          showComparison(tab, true);
        }
      });
    });
    versus.addEventListener("ended", function () {
      var index = versusTabs.findIndex(function (tab) {
        return tab.getAttribute("aria-pressed") === "true";
      });
      var next = versusTabs[(index + 1) % versusTabs.length];
      showComparison(next, Boolean(versus.dataset.onscreen));
    });
  }

  // ---- 3D viewer ----
  var viewer = document.getElementById("viewer");
  var poster = document.getElementById("viewer-poster");
  var start = document.getElementById("viewer-start");
  var sceneTitle = document.getElementById("scene-title");
  var sceneInput = document.getElementById("scene-input");
  var sceneCoords = document.getElementById("scene-coords");
  var sceneMap = document.getElementById("scene-map");
  var sceneButtons = document.querySelectorAll(".scene");
  var frame = null;
  var current = document.querySelector('.scene[aria-pressed="true"]');

  function viewerUrl(id) {
    return "https://superspl.at/s?id=" + encodeURIComponent(id);
  }

  function loadFrame() {
    if (!current) {
      return;
    }
    if (!frame) {
      frame = document.createElement("iframe");
      frame.setAttribute("allow", "fullscreen; xr-spatial-tracking");
      frame.setAttribute("allowfullscreen", "");
      viewer.appendChild(frame);
      start.hidden = true;
    }
    frame.title = "Interactive 3DGS Viewer: " + sceneName(current);
    frame.src = viewerUrl(current.dataset.id);
  }

  // Titles follow the scenes' published names; counts and coordinates are from the paper's tables.
  function sceneName(button) {
    var d = button.dataset;
    return d.name + ", " + d.place + " (" + d.code + ")";
  }

  function describe(button) {
    var d = button.dataset;
    sceneTitle.textContent = sceneName(button);
    sceneInput.textContent = d.count + " training images";
    sceneCoords.textContent = d.lon.replace("-", "") + "\u00b0W, " + d.lat + "\u00b0N";
    sceneMap.href =
      "https://www.google.com/maps/@?api=1&map_action=map&basemap=satellite&zoom=17&center=" +
      d.lat + "," + d.lon;
  }

  function select(button) {
    if (button === current) {
      return;
    }
    if (current) {
      current.setAttribute("aria-pressed", "false");
    }
    button.setAttribute("aria-pressed", "true");
    current = button;
    describe(button);
    poster.src = "static/media/scenes/" + button.dataset.id + ".webp";
    poster.alt = sceneName(button);
    if (frame) {
      loadFrame();
    }
  }

  if (viewer && start) {
    start.addEventListener("click", loadFrame);
    sceneButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        select(button);
      });
    });
    if (current) {
      describe(current);
    }
  }

  // ---- talk video: load the player only when asked ----
  document.querySelectorAll(".yt").forEach(function (button) {
    button.addEventListener("click", function () {
      var player = document.createElement("iframe");
      player.className = "yt-frame";
      player.src = "https://www.youtube.com/embed/" + button.dataset.yt + "?autoplay=1";
      player.title = button.dataset.title;
      player.setAttribute(
        "allow",
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      );
      player.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      player.setAttribute("allowfullscreen", "");
      button.replaceWith(player);
    });
  });

  // ---- BibTeX copy ----
  var copy = document.getElementById("copy-bibtex");
  var bibtex = document.getElementById("bibtex");
  if (copy && bibtex && navigator.clipboard) {
    copy.addEventListener("click", function () {
      navigator.clipboard.writeText(bibtex.textContent).then(function () {
        copy.textContent = "Copied";
        setTimeout(function () {
          copy.textContent = "Copy";
        }, 2000);
      });
    });
  } else if (copy) {
    copy.hidden = true;
  }

  // ---- "More research" menu closes on outside click or Escape ----
  var more = document.querySelector(".more");
  if (more) {
    document.addEventListener("click", function (event) {
      if (more.open && !more.contains(event.target)) {
        more.open = false;
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && more.open) {
        more.open = false;
        more.querySelector("summary").focus();
      }
    });
  }
})();
