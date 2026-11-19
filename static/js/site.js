// Skyfall-GS project page behaviour. No dependencies.
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- hero film: pause and play ----
  var film = document.getElementById("film");
  var filmToggle = document.getElementById("film-toggle");
  if (film && filmToggle) {
    var syncToggle = function () {
      filmToggle.textContent = film.paused ? "Play" : "Pause";
    };
    filmToggle.addEventListener("click", function () {
      if (film.paused) {
        film.play();
      } else {
        film.pause();
      }
    });
    film.addEventListener("play", syncToggle);
    film.addEventListener("pause", syncToggle);
    if (reduceMotion) {
      film.removeAttribute("autoplay");
      film.pause();
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

  // The method diagram builds up once, holds its final frame, then starts over.
  // Its poster is the first (empty) frame so playback starts without a flash;
  // readers who prefer reduced motion never see it play, so they get the finished diagram.
  var method = document.getElementById("method-video");
  if (method && reduceMotion) {
    method.poster = "static/media/method-full.jpg";
  }
  if (method) {
    method.addEventListener("ended", function () {
      setTimeout(function () {
        if (method.dataset.onscreen) {
          method.play().catch(function () {});
        }
      }, 5000);
    });
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
