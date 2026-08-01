(function () {
  "use strict";

  var icons = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.2 12 4l9 7.2v8.3a.5.5 0 0 1-.5.5h-5.2v-6H8.7v6H3.5a.5.5 0 0 1-.5-.5z"/></svg>',
    service: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.4 6.2a5 5 0 0 0-6.6 6.6L3 17.6 6.4 21l4.8-4.8a5 5 0 0 0 6.6-6.6l-3 3-3.4-.9-.9-3.4z"/></svg>',
    sell: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="17" r="3.2"/><circle cx="17" cy="17" r="3.2"/><path d="m7 17 3.2-7h4.3L17 17m-9.1-4.5h7.8M9.7 7h3.1"/></svg>',
    brands: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z"/></svg>',
    story: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.7-4 3-6 6.5-6s5.8 2 6.5 6"/></svg>',
    contact: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v11H9l-5 3z"/><path d="m5 7 7 5 7-5"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14v15H5zM8 3v5m8-5v5M5 10h14"/><path d="m9 15 2 2 4-4"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg>'
  };

  var routes = [
    { href: "index.html", label: "Home", key: "home" },
    { href: "services.html", label: "Workshop", key: "service" },
    { href: "buying-selling.html", label: "Bike sales", key: "sell" },
    { href: "our-brands.html", label: "Brands", key: "brands", desktopOnly: true },
    { href: "about.html", label: "Story", key: "story", desktopOnly: true },
    { href: "contact.html", label: "Contact", key: "contact", desktopOnly: true },
    { href: "booking.html", label: "Book", key: "book", desktopOnly: true }
  ];

  function currentFile() {
    var file = window.location.pathname.split("/").pop();
    return file || "index.html";
  }

  function makeLink(route, className) {
    var link = document.createElement("a");
    link.href = route.href;
    link.className = className;
    link.innerHTML = '<span class="tool-dock__icon">' + icons[route.key] + '</span><span class="tool-dock__label">' + route.label + "</span>";
    if (route.desktopOnly) {
      link.classList.add("tool-dock__desktop-only");
    }
    if (currentFile() === route.href || (currentFile() === "thanks-for-booking.html" && route.href === "booking.html")) {
      link.setAttribute("aria-current", "page");
    }
    return link;
  }

  function addHeaderActions() {
    var headerInner = document.querySelector(".header-inner");
    if (!headerInner || headerInner.querySelector(".precision-actions")) {
      return;
    }

    var actions = document.createElement("div");
    actions.className = "precision-actions";
    actions.innerHTML = '<a class="precision-phone" href="tel:02102901656">021 0290 1656</a><a class="precision-book" href="booking.html">Book a service</a>';
    headerInner.appendChild(actions);
  }

  function addMenuSheet() {
    var menu = document.createElement("div");
    menu.className = "precision-menu";
    menu.id = "precision-menu";
    menu.hidden = true;

    var backdrop = document.createElement("button");
    backdrop.type = "button";
    backdrop.className = "precision-menu__backdrop";
    backdrop.setAttribute("aria-label", "Close menu");

    var panel = document.createElement("div");
    panel.className = "precision-menu__panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "precision-menu-title");
    panel.setAttribute("tabindex", "-1");

    var panelHead = document.createElement("div");
    panelHead.className = "precision-menu__head";
    panelHead.innerHTML = '<h2 id="precision-menu-title">Bottle Lake Bikes</h2>';

    var close = document.createElement("button");
    close.type = "button";
    close.className = "precision-menu__close";
    close.setAttribute("aria-label", "Close menu");
    close.innerHTML = icons.close;
    panelHead.appendChild(close);

    var nav = document.createElement("nav");
    nav.className = "precision-menu__nav";
    nav.setAttribute("aria-label", "All pages");
    routes.forEach(function (route) {
      var link = document.createElement("a");
      link.href = route.href;
      link.innerHTML = '<span class="precision-menu__icon">' + icons[route.key] + "</span><span>" + route.label + "</span>";
      if (currentFile() === route.href) {
        link.setAttribute("aria-current", "page");
      }
      nav.appendChild(link);
    });

    panel.appendChild(panelHead);
    panel.appendChild(nav);
    menu.appendChild(backdrop);
    menu.appendChild(panel);
    document.body.appendChild(menu);

    return { root: menu, panel: panel, close: close, backdrop: backdrop };
  }

  function addToolDock(menuParts) {
    var dock = document.createElement("nav");
    dock.className = "tool-dock";
    dock.setAttribute("aria-label", "Quick navigation");

    routes.forEach(function (route) {
      dock.appendChild(makeLink(route, "tool-dock__item"));
    });

    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "tool-dock__item tool-dock__menu";
    trigger.setAttribute("aria-controls", "precision-menu");
    trigger.setAttribute("aria-expanded", "false");
    trigger.innerHTML = '<span class="tool-dock__icon">' + icons.menu + '</span><span class="tool-dock__label">Menu</span>';
    dock.appendChild(trigger);
    document.body.appendChild(dock);

    var lastFocus = null;

    function openMenu() {
      lastFocus = document.activeElement;
      menuParts.root.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      document.body.classList.add("precision-menu-open");
      menuParts.panel.focus();
      window.requestAnimationFrame(function () {
        menuParts.root.classList.add("is-open");
      });
    }

    function closeMenu() {
      menuParts.root.classList.remove("is-open");
      menuParts.root.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("precision-menu-open");
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    }

    trigger.addEventListener("click", openMenu);
    menuParts.close.addEventListener("click", closeMenu);
    menuParts.backdrop.addEventListener("click", closeMenu);
    menuParts.root.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        closeMenu();
      }
    });
    menuParts.root.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab") {
        return;
      }
      var focusable = Array.prototype.slice.call(menuParts.panel.querySelectorAll('a[href],button:not([disabled])'));
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
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !menuParts.root.hidden) {
        event.preventDefault();
        closeMenu();
      }
    });
  }

  function addProgressRail() {
    var rail = document.createElement("div");
    rail.className = "precision-progress";
    rail.setAttribute("aria-hidden", "true");
    rail.innerHTML = "<span></span>";
    document.body.appendChild(rail);

    var scheduled = false;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      rail.firstElementChild.style.transform = "scaleX(" + ratio + ")";
      scheduled = false;
    }
    function requestUpdate() {
      if (!scheduled) {
        scheduled = true;
        window.requestAnimationFrame(update);
      }
    }
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    update();
  }

  function addMeasuredMotion() {
    var sections = Array.prototype.slice.call(document.querySelectorAll("main > section"));
    var images = Array.prototype.slice.call(document.querySelectorAll(".hero-photo-frame, .section-photo-frame, .about-image-card"));
    var reduceMotion = false;

    sections.forEach(function (section) {
      section.classList.add("precision-measured");
      var line = document.createElement("span");
      line.className = "precision-measure-line";
      line.setAttribute("aria-hidden", "true");
      section.appendChild(line);
    });
    images.forEach(function (item) {
      item.classList.add("precision-image-mask");
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      sections.concat(images).forEach(function (item) {
        item.classList.add("is-precision-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-precision-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "20% 0px 20% 0px" });

    sections.concat(images).forEach(function (item) {
      observer.observe(item);
    });
  }

  function init() {
    var file = currentFile().replace(/\.html$/, "") || "index";
    document.body.setAttribute("data-concept-page", file);
    document.documentElement.classList.add("precision-concept");
    addHeaderActions();
    var menu = addMenuSheet();
    addToolDock(menu);
    addProgressRail();
    addMeasuredMotion();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
