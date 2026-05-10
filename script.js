const root = document.documentElement;
root.classList.add("js", "force-site-motion");

const prefersReducedMotion = () => false;
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const form = document.querySelector("[data-mockup-form]");
const formStatus = document.querySelector("[data-form-status]");
const contactForm = document.querySelector("[data-contact-form]");
const contactFormStatus = document.querySelector("[data-contact-form-status]");
const year = document.querySelector("[data-year]");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const scrollBehavior = () => (prefersReducedMotion() ? "auto" : "smooth");
const transitionKey = "bm-site-transition";

const resetReloadScroll = () => {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  const navigationEntry = performance.getEntriesByType("navigation")[0];
  const isReload = navigationEntry
    ? navigationEntry.type === "reload"
    : performance.navigation && performance.navigation.type === performance.navigation.TYPE_RELOAD;

  if (!isReload) return;

  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  root.style.scrollBehavior = previousScrollBehavior;
};

const consumeInternalTransition = () => {
  try {
    const value = sessionStorage.getItem(transitionKey);
    sessionStorage.removeItem(transitionKey);
    return value === "internal";
  } catch {
    return false;
  }
};

const storeInternalTransition = () => {
  try {
    sessionStorage.setItem(transitionKey, "internal");
  } catch {
    return;
  }
};

const getStoredTheme = () => {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
};

const storeTheme = (theme) => {
  try {
    localStorage.setItem("theme", theme);
  } catch {
    return;
  }
};

let themeTransitionTimer;

const applyTheme = (theme) => {
  const nextTheme = theme === "light" ? "light" : "dark";
  root.setAttribute("data-theme", nextTheme);

  if (themeToggle) {
    const nextLabel = nextTheme === "light" ? "Switch to dark theme" : "Switch to light theme";
    themeToggle.setAttribute("aria-label", nextLabel);
    themeToggle.setAttribute("title", nextLabel);
  }
};

const transitionTheme = (theme) => {
  const nextTheme = theme === "light" ? "light" : "dark";
  const currentTheme = root.getAttribute("data-theme") === "light" ? "light" : "dark";

  if (nextTheme === currentTheme) {
    applyTheme(nextTheme);
    return;
  }

  window.clearTimeout(themeTransitionTimer);
  root.classList.remove("is-theme-revealing");
  root.style.setProperty("--theme-transition-wash", currentTheme === "light" ? "#f7f4ee" : "#070b12");
  root.classList.add("is-theme-changing");

  void root.offsetWidth;

  requestAnimationFrame(() => {
    applyTheme(nextTheme);

    requestAnimationFrame(() => {
      root.classList.add("is-theme-revealing");
    });
  });

  themeTransitionTimer = window.setTimeout(() => {
    root.classList.remove("is-theme-changing", "is-theme-revealing");
    root.style.removeProperty("--theme-transition-wash");
  }, 620);
};

applyTheme(getStoredTheme() || root.getAttribute("data-theme") || "dark");
resetReloadScroll();

if (year) {
  year.textContent = new Date().getFullYear();
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    transitionTheme(nextTheme);
    storeTheme(nextTheme);
  });
}

const closeMenu = () => {
  if (!nav || !menuToggle) return;
  nav.classList.remove("is-open");
  if (header) header.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
};

const openMenu = () => {
  if (!nav || !menuToggle) return;
  nav.classList.add("is-open");
  if (header) header.classList.add("is-open");
  document.body.classList.add("menu-open");
  menuToggle.setAttribute("aria-expanded", "true");
};

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });
}

if (nav) {
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const updateHeader = () => {
  if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const setupPageIntro = () => {
  if (prefersReducedMotion()) {
    root.classList.add("intro-complete");
    return;
  }

  const hero = document.querySelector(".hero, .page-hero");
  if (!hero || !document.body) return;
  const isInternalHandoff = consumeInternalTransition();
  const delayScale = isInternalHandoff ? 0.42 : 1;

  const items = [];
  const addIntroItem = (element, type, delay) => {
    if (!element) return;
    element.dataset.intro = type;
    element.style.setProperty("--intro-delay", `${Math.round(delay * delayScale)}ms`);
    items.push(element);
  };

  addIntroItem(hero.querySelector(".eyebrow"), "hero", 340);
  addIntroItem(hero.querySelector("h1"), "hero", 430);
  addIntroItem(hero.querySelector(".hero-subhead, .page-subhead"), "hero", 520);
  addIntroItem(hero.querySelector(".hero-actions"), "hero", 610);

  root.classList.add("motion-prep", "intro-active");

  requestAnimationFrame(() => {
    window.setTimeout(() => {
      root.classList.add("intro-release");
      items.forEach((item) => item.classList.add("is-intro-visible"));
    }, isInternalHandoff ? 40 : 90);
  });

  window.setTimeout(() => {
    items.forEach((item) => {
      if (item.classList.contains("reveal")) item.classList.add("is-visible");
    });
    hero.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
    root.classList.remove("motion-prep", "intro-active", "intro-release");
    root.classList.add("intro-complete");
  }, isInternalHandoff ? 620 : 980);
};

const setupRevealStagger = () => {
  const staggerGroups = document.querySelectorAll(
    ".three-grid, .pricing-grid, .process-grid, .demo-grid, .portfolio-grid, .audience-grid, .why-benefit-grid, .why-stack, .demo-mini-grid, .faq-list, .bio-stack"
  );

  staggerGroups.forEach((group) => {
    Array.from(group.children)
      .filter((child) => child.classList.contains("reveal"))
      .forEach((child, index) => {
        child.style.setProperty("--reveal-delay", `${Math.min(index * 70, 280)}ms`);
      });
  });
};

const setupReveals = () => {
  setupRevealStagger();

  const revealItems = document.querySelectorAll(".reveal:not([data-scroll-reveal]):not([data-slow-reveal])");
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -52px 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
};

const setupSlowReveals = () => {
  const items = document.querySelectorAll("[data-slow-reveal]");
  if (!items.length) return;

  if (prefersReducedMotion()) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const afterIntroRelease = (callback) => {
    if (root.classList.contains("intro-release") || root.classList.contains("intro-complete")) {
      callback();
      return;
    }

    const checkIntro = () => {
      if (root.classList.contains("intro-release") || root.classList.contains("intro-complete")) {
        callback();
        return;
      }

      window.setTimeout(checkIntro, 40);
    };

    checkIntro();
  };

  const showItem = (item) => {
    if (item.dataset.slowRevealStarted === "true") return;
    item.dataset.slowRevealStarted = "true";

    const delay = Number.parseInt(item.dataset.slowRevealDelay || "0", 10);
    afterIntroRelease(() => {
      window.setTimeout(() => item.classList.add("is-visible"), Number.isNaN(delay) ? 0 : delay);
    });
  };

  if (!("IntersectionObserver" in window)) {
    items.forEach(showItem);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        showItem(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -52px 0px" }
  );

  items.forEach((item) => observer.observe(item));
};

const setupScrollReactiveReveals = () => {
  const items = document.querySelectorAll("[data-scroll-reveal]");
  if (!items.length) return;

  if (prefersReducedMotion()) {
    items.forEach((item) => {
      item.classList.add("is-visible");
      item.style.setProperty("--scroll-fade", "1");
      item.style.setProperty("--scroll-y", "0px");
      item.style.setProperty("--scroll-scale", "1");
    });
    return;
  }

  let ticking = false;
  const smooth = (value) => value * value * (3 - 2 * value);

  const update = () => {
    ticking = false;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportCenter = viewportHeight * 0.5;

    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.top + rect.height * 0.5;
      const distance = Math.abs(itemCenter - viewportCenter);
      const fullDistance = viewportHeight * 0.08;
      const fadeDistance = viewportHeight * 0.64;
      const progress = smooth(1 - clamp((distance - fullDistance) / (fadeDistance - fullDistance), 0, 1));
      const direction = itemCenter < viewportCenter ? -1 : 1;
      const offset = (1 - progress) * 34 * direction;
      const scale = 0.985 + progress * 0.015;

      item.classList.toggle("is-visible", progress > 0.02);
      item.style.setProperty("--scroll-fade", progress.toFixed(3));
      item.style.setProperty("--scroll-y", `${offset.toFixed(1)}px`);
      item.style.setProperty("--scroll-scale", scale.toFixed(3));
    });
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
};

const setupDepthScrollSections = () => {
  const sections = document.querySelectorAll("[data-depth-scroll]");
  if (!sections.length) return;

  if (prefersReducedMotion()) {
    sections.forEach((section) => {
      section.style.setProperty("--depth-bg-y", "0px");
      section.style.setProperty("--depth-content-y", "0px");
    });
    return;
  }

  let ticking = false;

  const update = () => {
    ticking = false;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const isNarrow = window.innerWidth < 720;
    const bgDistance = isNarrow ? 245 : 640;
    const contentDistance = isNarrow ? 150 : 490;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const range = viewportHeight + rect.height;
      const rawProgress = range ? (viewportHeight - rect.top) / range : 0.5;
      const progress = clamp(rawProgress, 0, 1);
      const drift = progress - 0.5;

      section.style.setProperty("--depth-bg-y", `${(drift * bgDistance).toFixed(1)}px`);
      section.style.setProperty("--depth-content-y", `${(drift * contentDistance).toFixed(1)}px`);
    });
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
};

const setupTetherPanels = () => {
  const panels = document.querySelectorAll("[data-tether-panel]");
  const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (!panels.length || prefersReducedMotion() || !hoverQuery.matches) return;

  const applyFrame = (panel, state) => {
    panel.style.setProperty("--tether-x", `${state.x.toFixed(2)}px`);
    panel.style.setProperty("--tether-y", `${state.y.toFixed(2)}px`);
    panel.style.setProperty("--tether-rotate-x", `${state.rotateX.toFixed(2)}deg`);
    panel.style.setProperty("--tether-rotate-y", `${state.rotateY.toFixed(2)}deg`);
    panel.style.setProperty("--tether-light-x", `${state.lightX.toFixed(1)}%`);
    panel.style.setProperty("--tether-light-y", `${state.lightY.toFixed(1)}%`);
    panel.style.setProperty("--tether-glow", state.glow.toFixed(3));
  };

  panels.forEach((panel) => {
    const state = { x: 0, y: 0, rotateX: 0, rotateY: 0, lightX: 50, lightY: 50, glow: 0 };
    const target = { ...state };
    let frame = null;
    let easing = 0.07;

    const animate = () => {
      let isMoving = false;

      Object.keys(state).forEach((key) => {
        const delta = target[key] - state[key];
        state[key] += delta * easing;
        if (Math.abs(delta) > 0.01) isMoving = true;
      });

      applyFrame(panel, state);
      frame = isMoving ? requestAnimationFrame(animate) : null;
    };

    const requestFrame = () => {
      if (!frame) frame = requestAnimationFrame(animate);
    };

    panel.addEventListener("pointermove", (event) => {
      const rect = panel.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      const pullX = x * 2 - 1;
      const pullY = y * 2 - 1;

      easing = 0.07;
      target.x = pullX * 5;
      target.y = pullY * 3.5;
      target.rotateX = pullY * -2.2;
      target.rotateY = pullX * 2.9;
      target.lightX = x * 100;
      target.lightY = y * 100;
      target.glow = 1;
      panel.classList.add("is-tether-active");
      requestFrame();
    });

    panel.addEventListener("pointerleave", () => {
      easing = 0.045;
      target.x = 0;
      target.y = 0;
      target.rotateX = 0;
      target.rotateY = 0;
      target.lightX = 50;
      target.lightY = 50;
      target.glow = 0;
      panel.classList.remove("is-tether-active");
      requestFrame();
    });
  });
};

const setupProcessTimelines = () => {
  const timelines = document.querySelectorAll("[data-process-timeline]");
  if (!timelines.length) return;

  timelines.forEach((timeline) => {
    const steps = Array.from(timeline.children).filter((child) => child.classList.contains("process-step"));
    if (!steps.length) return;

    const activateStep = (doneCount) => {
      const loadingIndex = doneCount < steps.length ? doneCount : -1;

      steps.forEach((step, index) => {
        const isDone = index < doneCount;
        const isLoading = index === loadingIndex;

        step.classList.toggle("is-done", isDone);
        step.classList.toggle("is-loading", isLoading);
        step.classList.toggle("is-past", isDone);
        step.classList.toggle("is-active", isLoading);
      });

      const progressIndex = doneCount === steps.length ? steps.length - 1 : Math.max(doneCount, 0);
      const progress = steps.length > 1 ? (progressIndex / (steps.length - 1)) * 100 : 100;
      timeline.style.setProperty("--timeline-progress", `${progress}%`);
    };

    if (prefersReducedMotion()) {
      activateStep(steps.length);
      return;
    }

    let ticking = false;
    const updateTimeline = () => {
      ticking = false;
      const rect = timeline.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const startLine = Math.min(viewportHeight * 0.42, 360);
      const completeLine = Math.min(viewportHeight * 0.26, 220);
      const range = Math.max(rect.height + startLine - completeLine, 1);
      const ratio = clamp((startLine - rect.top) / range, 0, 1);
      const doneCount = ratio <= 0 ? 0 : clamp(Math.ceil(ratio * steps.length), 0, steps.length);
      activateStep(doneCount);
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateTimeline);
    };

    updateTimeline();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
  });
};

const setupCarousels = () => {
  const carousels = document.querySelectorAll("[data-demo-carousel]");
  if (!carousels.length) return;

  carousels.forEach((carousel) => {
    const track = carousel.querySelector("[data-carousel-track]");
    const previous = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    const progress = carousel.querySelector("[data-carousel-progress]");
    const progressBar = carousel.querySelector("[data-carousel-progress-bar]");
    if (!track || !previous || !next) return;

    const getStepSize = () => {
      const firstCard = track.querySelector(".demo-card");
      const styles = window.getComputedStyle(track);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
      return firstCard ? firstCard.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    };

    const updateControls = () => {
      const maxScroll = track.scrollWidth - track.clientWidth - 2;
      previous.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= maxScroll;

      if (progress && progressBar) {
        const trackWidth = progress.clientWidth;
        const scrollRange = Math.max(track.scrollWidth - track.clientWidth, 1);
        const visibleRatio = clamp(track.clientWidth / track.scrollWidth, 0.12, 1);
        const barWidth = Math.max(trackWidth * visibleRatio, 44);
        const travel = Math.max(trackWidth - barWidth, 0);
        const x = travel * clamp(track.scrollLeft / scrollRange, 0, 1);
        progress.style.setProperty("--carousel-progress-width", `${barWidth.toFixed(1)}px`);
        progress.style.setProperty("--carousel-progress-x", `${x.toFixed(1)}px`);
      }
    };

    const move = (direction) => {
      track.scrollBy({
        left: direction * getStepSize(),
        behavior: scrollBehavior(),
      });
    };

    previous.addEventListener("click", () => move(-1));
    next.addEventListener("click", () => move(1));
    track.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);

    if (progress) {
      const scrollToProgress = (clientX) => {
        const rect = progress.getBoundingClientRect();
        const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
        track.scrollLeft = ratio * (track.scrollWidth - track.clientWidth);
      };

      progress.addEventListener("pointerdown", (event) => {
        if (event.pointerType && event.pointerType !== "mouse") return;
        event.preventDefault();
        progress.classList.add("is-dragging");
        progress.setPointerCapture(event.pointerId);
        scrollToProgress(event.clientX);
      });

      progress.addEventListener("pointermove", (event) => {
        if (!progress.classList.contains("is-dragging")) return;
        event.preventDefault();
        scrollToProgress(event.clientX);
      });

      const stopDragging = (event) => {
        progress.classList.remove("is-dragging");
        if (progress.hasPointerCapture(event.pointerId)) {
          progress.releasePointerCapture(event.pointerId);
        }
      };

      progress.addEventListener("pointerup", stopDragging);
      progress.addEventListener("pointercancel", stopDragging);
    }

    track.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    });

    updateControls();
  });
};

const setupFaqAccordions = () => {
  const items = document.querySelectorAll(".faq-item");
  if (!items.length) return;

  items.forEach((item) => {
    const summary = item.querySelector("summary");
    if (!summary) return;

    let animation = null;
    const duration = 280;
    const easing = "cubic-bezier(0.22, 1, 0.36, 1)";

    const finish = (isOpen) => {
      item.open = isOpen;
      item.style.height = "";
      item.classList.remove("is-opening", "is-closing");
      animation = null;
    };

    const closedHeight = () => summary.offsetHeight;

    const closeItem = () => {
      const startHeight = item.offsetHeight;
      if (animation) animation.cancel();

      const endHeight = closedHeight();
      item.style.height = `${startHeight}px`;
      item.classList.remove("is-opening");
      item.classList.add("is-closing");

      animation = item.animate(
        { height: [`${startHeight}px`, `${endHeight}px`] },
        { duration, easing }
      );
      animation.onfinish = () => finish(false);
      animation.oncancel = () => {
        animation = null;
      };
    };

    const openItem = () => {
      const startHeight = item.open ? item.offsetHeight : closedHeight();
      if (animation) animation.cancel();

      item.style.height = `${startHeight}px`;
      item.open = true;
      item.classList.remove("is-closing");
      item.classList.add("is-opening");

      requestAnimationFrame(() => {
        const endHeight = item.scrollHeight;
        animation = item.animate(
          { height: [`${startHeight}px`, `${endHeight}px`] },
          { duration, easing }
        );
        animation.onfinish = () => finish(true);
        animation.oncancel = () => {
          animation = null;
        };
      });
    };

    summary.addEventListener("click", (event) => {
      if (prefersReducedMotion()) return;

      event.preventDefault();
      item.open ? closeItem() : openItem();
    });
  });
};

const setupCustomCursor = () => {
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (prefersReducedMotion() || !hasFinePointer || navigator.maxTouchPoints > 0) return;

  const cursor = document.createElement("div");
  cursor.className = "cursor-follower";
  cursor.setAttribute("aria-hidden", "true");
  document.body.append(cursor);

  const current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const target = { x: current.x, y: current.y };

  const render = () => {
    current.x += (target.x - current.x) * 0.24;
    current.y += (target.y - current.y) * 0.24;
    cursor.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(render);
  };

  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      target.x = event.clientX;
      target.y = event.clientY;
      cursor.classList.add("is-visible");

      const interactive = event.target.closest("a, button, summary, label, [role='button'], [data-carousel-progress]");
      const field = event.target.closest("input, textarea, select");
      cursor.classList.toggle("is-active", Boolean(interactive) && !field);
    },
    { passive: true }
  );

  document.addEventListener("pointerleave", () => {
    cursor.classList.remove("is-visible", "is-active");
  });

  render();
};

const isNormalInternalLink = (link) => {
  const href = link.getAttribute("href");
  if (!href || href.startsWith("#")) return false;
  if (/^(mailto:|tel:|sms:|javascript:)/i.test(href)) return false;
  if (link.hasAttribute("download")) return false;
  if (link.target && link.target !== "_self") return false;

  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return false;

  return true;
};

const setupPageTransitions = () => {
  window.addEventListener("pageshow", () => {
    root.classList.remove("page-leaving", "intro-release");
  });

  document.addEventListener("click", (event) => {
    if (prefersReducedMotion()) return;
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest("a[href]");
    if (!link || !isNormalInternalLink(link)) return;

    event.preventDefault();
    closeMenu();
    storeInternalTransition();
    root.classList.add("page-leaving");

    window.setTimeout(() => {
      window.location.href = link.href;
    }, 210);
  });
};

setupPageIntro();
setupReveals();
setupSlowReveals();
setupScrollReactiveReveals();
setupDepthScrollSections();
setupTetherPanels();
setupProcessTimelines();
setupCarousels();
setupFaqAccordions();
setupCustomCursor();
setupPageTransitions();

const setError = (name, message) => {
  const error = document.querySelector(`[data-error-for="${name}"]`);
  if (error) error.textContent = message;
};

const clearErrors = () => {
  document.querySelectorAll(".field-error").forEach((error) => {
    error.textContent = "";
  });
};

const isValidOptionalUrl = (input) => {
  if (!input || !input.value.trim()) return true;

  try {
    const url = new URL(input.value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

if (form && formStatus) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();

    const requiredFields = ["name", "email", "business", "business-type"];
    let isValid = true;

    requiredFields.forEach((id) => {
      const field = form.querySelector(`#${id}`);
      if (!field || !field.value.trim()) {
        setError(id, "Please fill this in.");
        isValid = false;
      }
    });

    const email = form.querySelector("#email");
    if (email && email.value.trim() && !email.checkValidity()) {
      setError("email", "Please enter a valid email address.");
      isValid = false;
    }

    const website = form.querySelector("#website");
    if (!isValidOptionalUrl(website)) {
      setError("website", "Please enter a full URL starting with http:// or https://.");
      isValid = false;
    }

    const googleProfile = form.querySelector("#google-profile");
    if (!isValidOptionalUrl(googleProfile)) {
      setError("google-profile", "Please enter a full URL starting with http:// or https://.");
      isValid = false;
    }

    const hasGoal = form.querySelectorAll('input[name="goals"]:checked').length > 0;
    if (!hasGoal) {
      setError("goals", "Choose at least one goal.");
      isValid = false;
    }

    const hasStyle = Boolean(form.querySelector('input[name="style"]:checked'));
    if (!hasStyle) {
      setError("style", "Choose a preferred style.");
      isValid = false;
    }

    if (!isValid) {
      const firstError = form.querySelector(".field-error:not(:empty)");
      if (firstError) firstError.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      return;
    }

    formStatus.textContent =
      "Thanks - I will review your business and send back a free homepage mockup within 5 business days. No pressure, no obligation.";
    formStatus.classList.add("is-visible");
    form.reset();
    formStatus.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
  });
}

if (contactForm && contactFormStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    contactFormStatus.textContent = "Thanks - the contact form front end is ready to connect to an inbox or form service.";
    contactFormStatus.classList.add("is-visible");
    contactForm.reset();
    contactFormStatus.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
  });
}
