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
      var bookingPage = pageName === "booking" || pageName === "thanks-for-booking";
      bookLink.href = bookingPage ? "tel:02102901656" : "booking.html";
      bookLink.textContent = bookingPage ? "Call the workshop" : "Book a service";
      if (!bookingPage) {
        bookLink.setAttribute("data-google-ads-conversion", "booking-start");
      }

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

    var menuScrim = document.querySelector(".menu-scrim");
    if (nav && toggle && !menuScrim) {
      menuScrim = document.createElement("button");
      menuScrim.className = "menu-scrim";
      menuScrim.type = "button";
      menuScrim.tabIndex = -1;
      menuScrim.setAttribute("aria-label", "Close site menu");
      menuScrim.setAttribute("aria-hidden", "true");
      document.body.appendChild(menuScrim);
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

    function closeMenu(returnFocus) {
      if (!nav || !toggle || !menuIsOpen()) {
        return;
      }

      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      syncMenuState(false);

      if (returnFocus) {
        toggle.focus({ preventScroll: true });
      }
    }

    if (nav && toggle) {
      syncMenuState(false);

      toggle.addEventListener("click", function () {
        window.requestAnimationFrame(function () {
          syncMenuState(true);
        });
      });

      if (menuScrim) {
        menuScrim.addEventListener("click", function () {
          closeMenu(true);
        });
      }

      nav.addEventListener("click", function (event) {
        if (event.target && event.target.closest("a")) {
          closeMenu(false);
        }
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
            closeMenu(true);
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
      reviewRail.setAttribute(
        "aria-label",
        "Customer reviews. Use the previous and next controls or the left and right arrow keys."
      );

      var railControls = document.createElement("div");
      railControls.className = "review-rail-controls";
      railControls.innerHTML =
        '<button class="rail-button" type="button" data-review-previous>Previous</button>' +
        '<button class="rail-button" type="button" data-review-next>Next</button>';
      reviewRail.parentNode.insertBefore(railControls, reviewRail);

      var previousButton = railControls.querySelector("[data-review-previous]");
      var nextButton = railControls.querySelector("[data-review-next]");
      var updateRailControls = function () {
        var maxScroll = Math.max(0, reviewRail.scrollWidth - reviewRail.clientWidth);
        previousButton.disabled = reviewRail.scrollLeft <= 4;
        nextButton.disabled = reviewRail.scrollLeft >= maxScroll - 4 || maxScroll <= 4;
      };
      var moveReviewRail = function (direction) {
        var reduceMotion = false;
        reviewRail.scrollBy({
          left: direction * Math.max(280, reviewRail.clientWidth * 0.72),
          behavior: reduceMotion ? "auto" : "smooth"
        });
      };

      previousButton.addEventListener("click", function () {
        moveReviewRail(-1);
      });
      nextButton.addEventListener("click", function () {
        moveReviewRail(1);
      });
      reviewRail.addEventListener("keydown", function (event) {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          moveReviewRail(event.key === "ArrowLeft" ? -1 : 1);
        }
      });
      reviewRail.addEventListener("scroll", updateRailControls, { passive: true });
      window.addEventListener("resize", updateRailControls);
      document.addEventListener("reviews:change", function () {
        window.requestAnimationFrame(updateRailControls);
      });
      updateRailControls();
    }

    var brandSearch = document.getElementById("brand-search");
    var brandCatalogue = document.getElementById("brand-catalogue");
    if (brandSearch && brandCatalogue) {
      var brandCards = Array.prototype.slice.call(brandCatalogue.querySelectorAll(".brand-card"));
      var resultCount = document.getElementById("brand-results-count");
      var emptyState = document.getElementById("brand-empty-state");
      var clearSearch = document.querySelector("[data-clear-brand-search]");
      var normalise = function (value) {
        var text = String(value || "").toLowerCase();
        return text.normalize ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : text;
      };
      var filterBrands = function () {
        var query = normalise(brandSearch.value.trim());
        var visibleCount = 0;

        brandCards.forEach(function (card) {
          var matches = !query || normalise(card.textContent).indexOf(query) !== -1;
          card.hidden = !matches;
          if (matches) {
            visibleCount += 1;
          }
        });

        brandCatalogue.classList.toggle("is-filtered", Boolean(query));
        if (resultCount) {
          resultCount.textContent = query
            ? visibleCount + (visibleCount === 1 ? " match" : " matches")
            : brandCards.length + " brands shown";
        }
        if (emptyState) {
          emptyState.hidden = visibleCount !== 0;
        }
      };

      brandSearch.addEventListener("input", filterBrands);
      if (clearSearch) {
        clearSearch.addEventListener("click", function () {
          brandSearch.value = "";
          filterBrands();
          brandSearch.focus();
        });
      }
      filterBrands();
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
