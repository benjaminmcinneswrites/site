(function () {
  "use strict";

  function ready() {
    var body = document.body;
    var headerInner = document.querySelector(".header-inner");
    var nav = document.getElementById("primary-navigation");
    var toggle = document.querySelector(".nav-toggle");

    var fileName = window.location.pathname.split("/").pop() || "index.html";
    var pageName = fileName.replace(/\.html$/i, "") || "index";
    body.classList.add("page-" + pageName.replace(/[^a-z0-9]+/gi, "-").toLowerCase());

    if (headerInner && !headerInner.querySelector(".header-book")) {
      var bookLink = document.createElement("a");
      bookLink.className = "header-book";
      bookLink.href = "booking.html";
      bookLink.textContent = "Book a service";
      bookLink.setAttribute("data-google-ads-conversion", "booking-start");

      if (toggle) {
        headerInner.insertBefore(bookLink, toggle);
      } else {
        headerInner.appendChild(bookLink);
      }
    }

    if (nav && !nav.querySelector(".concept-menu-meta")) {
      var menuMeta = document.createElement("div");
      menuMeta.className = "concept-menu-meta";
      menuMeta.innerHTML =
        '<p><strong>Workshop</strong>43 Broadhaven Ave<br>Parklands, Christchurch</p>' +
        '<p><strong>Get in touch</strong><a href="tel:02102901656">021 0290 1656</a><br>' +
        '<a href="mailto:contact@bottlelakebikes.co.nz">Email Bottle Lake Bikes</a></p>';
      nav.appendChild(menuMeta);
    }

    function menuIsOpen() {
      return Boolean(
        nav &&
          toggle &&
          (nav.classList.contains("is-open") || toggle.getAttribute("aria-expanded") === "true")
      );
    }

    function syncMenuState(moveFocus) {
      if (!nav || !toggle) {
        return;
      }

      var open = menuIsOpen();
      body.classList.toggle("menu-open", open);
      nav.setAttribute("aria-hidden", String(!open));
      nav.inert = !open;
      toggle.setAttribute("aria-label", open ? "Close site menu" : "Open site menu");

      if (open && moveFocus) {
        var firstLink = nav.querySelector("a");
        if (firstLink) {
          firstLink.focus({ preventScroll: true });
        }
      }
    }

    if (nav && toggle) {
      syncMenuState(false);

      toggle.addEventListener("click", function () {
        window.requestAnimationFrame(function () {
          syncMenuState(true);
        });
      });

      var stateObserver = new MutationObserver(function () {
        syncMenuState(false);
      });
      stateObserver.observe(toggle, { attributes: true, attributeFilter: ["aria-expanded"] });
      stateObserver.observe(nav, { attributes: true, attributeFilter: ["class"] });

      document.addEventListener(
        "keydown",
        function (event) {
          if (!menuIsOpen()) {
            return;
          }

          if (event.key === "Escape") {
            event.preventDefault();
            nav.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            syncMenuState(false);
            toggle.focus({ preventScroll: true });
            return;
          }

          if (event.key !== "Tab") {
            return;
          }

          var focusable = [toggle].concat(
            Array.prototype.slice.call(nav.querySelectorAll('a[href]:not([tabindex="-1"])'))
          );
          if (!focusable.length) {
            return;
          }

          var first = focusable[0];
          var last = focusable[focusable.length - 1];

          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        },
        true
      );
    }

    var heroGrid = document.querySelector(".hero-grid");
    if (heroGrid && !heroGrid.querySelector(".concept-loop")) {
      var loop = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      loop.setAttribute("class", "concept-loop");
      loop.setAttribute("viewBox", "0 0 1200 680");
      loop.setAttribute("preserveAspectRatio", "none");
      loop.setAttribute("aria-hidden", "true");
      loop.setAttribute("focusable", "false");

      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute(
        "d",
        "M72 438 C124 96 414 24 754 74 C1060 120 1190 288 1098 472 C1008 650 710 674 398 610 C142 558 26 536 72 438"
      );
      loop.appendChild(path);
      heroGrid.appendChild(loop);
    }

    var reviewRail = document.querySelector(".reviews-grid");
    if (reviewRail) {
      reviewRail.tabIndex = 0;
      reviewRail.setAttribute("aria-label", "Customer reviews. Scroll sideways to read more.");
    }

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        body.classList.add("concept-ready");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready, { once: true });
  } else {
    ready();
  }
})();
