(function () {
  "use strict";

  var body = document.body;
  var header = document.querySelector(".site-header");
  var nav = document.querySelector(".site-nav");
  var toggle = document.querySelector(".nav-toggle");

  if (!body || !header || !nav || !toggle) {
    return;
  }

  function addRailDetails() {
    if (!header.querySelector(".rail-label")) {
      var label = document.createElement("span");
      label.className = "rail-label";
      label.textContent = "Parklands, Christchurch";
      header.querySelector(".header-inner").insertBefore(label, nav);
    }

    if (!header.querySelector(".rail-book")) {
      var book = document.createElement("a");
      book.className = "rail-book";
      book.href = "booking.html";
      book.textContent = "Book in";
      header.querySelector(".header-inner").insertBefore(book, nav);
    }

    if (!nav.querySelector(".nav-sheet-heading")) {
      var heading = document.createElement("p");
      heading.className = "nav-sheet-heading";
      heading.textContent = "Bottle Lake Bikes";
      nav.insertBefore(heading, nav.firstChild);
    }

    if (!nav.querySelector(".nav-sheet-close")) {
      var closeButton = document.createElement("button");
      closeButton.className = "nav-sheet-close";
      closeButton.type = "button";
      closeButton.setAttribute("aria-label", "Close site menu");
      closeButton.innerHTML = '<span aria-hidden="true"></span>';
      closeButton.addEventListener("click", function () {
        closeNav(true);
      });
      nav.insertBefore(closeButton, nav.firstChild);
    }

    if (!nav.querySelector(".nav-sheet-contact")) {
      var contact = document.createElement("div");
      contact.className = "nav-sheet-contact";
      contact.innerHTML =
        '<a href="tel:02102901656">021 0290 1656</a>' +
        '<a href="mailto:contact@bottlelakebikes.co.nz">contact@bottlelakebikes.co.nz</a>';
      nav.appendChild(contact);
    }

    toggle.setAttribute("aria-label", "Open site menu");
  }

  function isOpen() {
    return toggle.getAttribute("aria-expanded") === "true";
  }

  function syncNavState(options) {
    var open = isOpen();
    body.classList.toggle("nav-sheet-open", open);
    toggle.setAttribute("aria-label", open ? "Close site menu" : "Open site menu");

    if (open && options && options.focusFirst) {
      var firstLink = nav.querySelector(".nav-sheet-close, a");
      if (firstLink) {
        window.setTimeout(function () {
          firstLink.focus();
        }, 30);
      }
    }
  }

  function closeNav(restoreFocus) {
    if (!isOpen()) {
      return;
    }

    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    syncNavState();

    if (restoreFocus) {
      toggle.focus();
    }
  }

  function trapFocus(event) {
    if (event.key !== "Tab" || !isOpen()) {
      return;
    }

    var focusable = Array.prototype.slice.call(
      nav.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
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
  }

  function addRouteGraphic() {
    var firstSection = document.querySelector("main > .hero, main > .page-hero, main > .section:first-child, main > .not-found-hero");
    if (!firstSection || firstSection.querySelector(".route-graphic")) {
      return;
    }

    var wrapper = document.createElement("div");
    wrapper.innerHTML =
      '<svg class="route-graphic" viewBox="0 0 760 430" aria-hidden="true" focusable="false">' +
      '<path d="M34 337 C112 286 98 197 177 170 C254 142 302 224 378 191 C455 158 442 74 527 62 C608 51 617 134 715 98 C664 174 590 188 560 255 C526 331 452 382 354 344 C264 308 188 377 101 361" />' +
      '<circle cx="34" cy="337" r="7" /><circle cx="715" cy="98" r="7" />' +
      '</svg>';
    firstSection.appendChild(wrapper.firstChild);
  }

  function initMediaReveals() {
    var frames = Array.prototype.slice.call(
      document.querySelectorAll(".hero-photo-frame, .section-photo-frame, .about-image-card")
    );

    if (!frames.length) {
      return;
    }

    frames.forEach(function (frame) {
      frame.classList.add("trail-media");
    });

    var reduceMotion = false;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      frames.forEach(function (frame) {
        frame.classList.add("is-trail-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-trail-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -6% 0px"
    });

    frames.forEach(function (frame) {
      observer.observe(frame);
    });
  }

  addRailDetails();
  addRouteGraphic();
  initMediaReveals();
  syncNavState();

  if ("MutationObserver" in window) {
    new MutationObserver(function () {
      syncNavState();
    }).observe(toggle, {
      attributes: true,
      attributeFilter: ["aria-expanded"]
    });
  }

  toggle.addEventListener("click", function () {
    window.setTimeout(function () {
      syncNavState({ focusFirst: isOpen() });
    }, 0);
  });

  nav.addEventListener("click", function (event) {
    if (event.target && event.target.closest("a")) {
      closeNav(false);
    }
  });

  document.addEventListener("click", function (event) {
    if (!isOpen()) {
      return;
    }

    if (!nav.contains(event.target) && !toggle.contains(event.target)) {
      closeNav(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (isOpen()) {
        closeNav(true);
      } else {
        syncNavState();
      }
      return;
    }
    trapFocus(event);
  });

  window.addEventListener("pageshow", function () {
    closeNav(false);
  });
}());
