(function () {
  "use strict";

  const root = document.documentElement;

  const heroImage = document.querySelector("[data-hero-image]");
  const revealHeroImage = () => {
    window.requestAnimationFrame(() => heroImage?.classList.add("is-loaded"));
  };

  if (heroImage?.complete) {
    revealHeroImage();
  } else {
    heroImage?.addEventListener("load", revealHeroImage, { once: true });
  }

  /* Mobile navigation uses the native dialog for focus containment and Escape support. */
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const menuOpen = document.querySelector("[data-menu-open]");
  const menuClose = document.querySelector("[data-menu-close]");
  let menuOpener = null;

  menuOpen?.addEventListener("click", () => {
    if (!mobileMenu || typeof mobileMenu.showModal !== "function") return;
    menuOpener = document.activeElement;
    mobileMenu.showModal();
    menuOpen.setAttribute("aria-expanded", "true");
    menuClose?.focus();
  });

  function closeMenu(restoreFocus = true) {
    if (!mobileMenu?.open) return;
    mobileMenu.close();
    menuOpen?.setAttribute("aria-expanded", "false");
    if (restoreFocus && menuOpener instanceof HTMLElement) menuOpener.focus({ preventScroll: true });
  }

  menuClose?.addEventListener("click", () => closeMenu(true));
  mobileMenu?.addEventListener("click", (event) => {
    if (event.target === mobileMenu) closeMenu(true);
  });

  mobileMenu?.querySelectorAll("[data-menu-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = link.hash ? document.querySelector(link.hash) : null;
      if (!target) return;
      event.preventDefault();
      closeMenu(false);
      history.pushState(null, "", link.hash);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* Keep the simple desktop navigation in sync with the section currently being read. */
  const desktopRoute = document.querySelector(".review-route--desktop");
  const routeLinks = [...document.querySelectorAll("[data-route-link]")];
  const routeSections = routeLinks
    .map((link) => document.getElementById(link.dataset.routeLink))
    .filter(Boolean);
  const visibleRouteSections = new Map();
  let routeNavigationTarget = "";
  let routeUnlockTimer = 0;

  function setActiveRoute(id) {
    const activeIndex = routeLinks.findIndex((link) => link.dataset.routeLink === id);
    routeLinks.forEach((link) => {
      if (link.dataset.routeLink === id) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    if (desktopRoute && activeIndex >= 0) desktopRoute.style.setProperty("--route-index", String(activeIndex));
  }

  function updateActiveRouteFromVisible() {
    const visible = [...visibleRouteSections.values()]
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => Math.abs(a.boundingClientRect.top - 150) - Math.abs(b.boundingClientRect.top - 150));
    if (visible[0]) setActiveRoute(visible[0].target.id);
  }

  function clearRouteNavigationLock() {
    routeNavigationTarget = "";
    updateActiveRouteFromVisible();
  }

  function scheduleRouteUnlock() {
    window.clearTimeout(routeUnlockTimer);
    routeUnlockTimer = window.setTimeout(clearRouteNavigationLock, 180);
  }

  routeLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.getElementById(link.dataset.routeLink);
      if (!target) return;
      event.preventDefault();
      routeNavigationTarget = target.id;
      setActiveRoute(target.id);
      history.pushState(null, "", link.hash);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      scheduleRouteUnlock();
    });
  });

  window.addEventListener("scroll", () => {
    if (routeNavigationTarget) scheduleRouteUnlock();
  }, { passive: true });

  if ("IntersectionObserver" in window) {
    const routeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visibleRouteSections.set(entry.target.id, entry));
        if (!routeNavigationTarget) updateActiveRouteFromVisible();
      },
      { rootMargin: "-12% 0px -62% 0px", threshold: [0, 0.05, 0.2] }
    );
    routeSections.forEach((section) => routeObserver.observe(section));
  }

  /* The situation icons settle individually as the reasons come into view. */
  const situations = [...document.querySelectorAll("[data-situation]")];
  if ("IntersectionObserver" in window) {
    const situationObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = situations.indexOf(entry.target);
          window.setTimeout(() => entry.target.classList.add("is-visible"), Math.max(0, index) * 70);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -16% 0px", threshold: 0.2 }
    );
    situations.forEach((situation) => situationObserver.observe(situation));
  } else {
    situations.forEach((situation) => situation.classList.add("is-visible"));
  }

  /* Four-step focus: only visual state changes. Scrolling is never intercepted or repositioned. */
  const processSteps = [...document.querySelectorAll("[data-process-step]")];
  let processFrame = 0;

  function updateProcessFocus() {
    processFrame = 0;
    if (!processSteps.length) return;
    const viewportCentre = window.innerHeight * 0.5;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    processSteps.forEach((step, index) => {
      const rect = step.getBoundingClientRect();
      const centre = rect.top + rect.height / 2;
      const distance = Math.abs(centre - viewportCentre);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    processSteps.forEach((step, index) => step.classList.toggle("is-active", index === closestIndex));
  }

  function queueProcessFocus() {
    if (processFrame) return;
    processFrame = window.requestAnimationFrame(updateProcessFocus);
  }

  window.addEventListener("scroll", queueProcessFocus, { passive: true });
  window.addEventListener("resize", queueProcessFocus, { passive: true });
  updateProcessFocus();

  /* Reviews cycle continuously in either direction. */
  const testimonials = [...document.querySelectorAll("[data-testimonial]")];
  const testimonialPrev = document.querySelector("[data-testimonial-prev]");
  const testimonialNext = document.querySelector("[data-testimonial-next]");
  const testimonialStatus = document.querySelector("[data-testimonial-status]");
  let testimonialIndex = 0;
  let testimonialLocked = false;

  function showTestimonial(nextIndex, direction) {
    if (!testimonials.length || testimonialLocked) return;
    const resolvedIndex = (nextIndex + testimonials.length) % testimonials.length;
    if (resolvedIndex === testimonialIndex) return;

    testimonialLocked = true;
    const current = testimonials[testimonialIndex];
    const incoming = testimonials[resolvedIndex];
    const exitClass = direction > 0 ? "is-exiting-left" : "is-exiting-right";
    const entryClass = direction > 0 ? "" : "is-from-left";

    current.classList.remove("is-active");
    current.classList.add(exitClass);
    current.setAttribute("aria-hidden", "true");

    incoming.classList.remove("is-exiting-left", "is-exiting-right", "is-from-left");
    if (entryClass) incoming.classList.add(entryClass);
    incoming.setAttribute("aria-hidden", "false");
    void incoming.offsetWidth;
    incoming.classList.add("is-active");
    incoming.classList.remove("is-from-left");

    testimonialIndex = resolvedIndex;
    if (testimonialStatus) testimonialStatus.textContent = `${testimonialIndex + 1} / ${testimonials.length}`;

    window.setTimeout(() => {
      current.classList.remove(exitClass);
      testimonialLocked = false;
    }, 380);
  }

  testimonialPrev?.addEventListener("click", () => showTestimonial(testimonialIndex - 1, -1));
  testimonialNext?.addEventListener("click", () => showTestimonial(testimonialIndex + 1, 1));
  if (testimonialPrev) testimonialPrev.disabled = false;
  if (testimonialNext) testimonialNext.disabled = false;

  /* FAQ accordion. */
  document.querySelectorAll(".faq-item button[aria-controls]").forEach((button) => {
    const answer = document.getElementById(button.getAttribute("aria-controls"));
    const initiallyOpen = false;
    button.setAttribute("aria-expanded", String(initiallyOpen));
    button.disabled = false;
    if (answer) {
      answer.inert = !initiallyOpen;
      answer.setAttribute("aria-hidden", String(!initiallyOpen));
    }

    button.addEventListener("click", () => {
      const willOpen = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(willOpen));
      if (answer) {
        answer.inert = !willOpen;
        answer.setAttribute("aria-hidden", String(!willOpen));
      }
    });
  });

  /* Non-transmitting preview form. */
  const reviewForm = document.querySelector("[data-review-form]");
  const reviewGoal = document.querySelector("[data-review-goal]");
  const ticketGoal = document.querySelector("[data-ticket-goal]");
  const ticketContact = document.querySelector("[data-ticket-contact]");
  const errorSummary = document.querySelector("[data-error-summary]");
  const formMessage = document.querySelector("[data-form-message]");
  const formSubmit = document.querySelector("[data-form-submit]");
  let validSweepPlayed = false;

  const fieldMessages = {
    "first-name": "Enter your first name.",
    "last-name": "Enter your last name.",
    email: "Enter a valid email address.",
    phone: "Enter your phone number.",
    "review-goal": "Choose what you would like help with."
  };

  function selectedContactMethod() {
    return reviewForm?.querySelector('input[name="contact-method"]:checked')?.value || "Email";
  }

  function updateReviewSummary() {
    const contact = selectedContactMethod();
    if (ticketGoal) ticketGoal.textContent = reviewGoal?.value || "Not selected";
    if (ticketContact) ticketContact.textContent = contact;
  }

  function errorElementFor(field) {
    return document.getElementById(`${field.id}-error`);
  }

  function validateField(field) {
    if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) return true;
    const valid = field.checkValidity();
    const errorElement = errorElementFor(field);
    field.setAttribute("aria-invalid", String(!valid));
    if (errorElement) errorElement.textContent = valid ? "" : fieldMessages[field.id] || "Check this field.";
    return valid;
  }

  function checkForValidSweep() {
    if (!reviewForm || validSweepPlayed || !reviewForm.checkValidity()) return;
    validSweepPlayed = true;
    formSubmit?.classList.add("is-valid-sweep");
  }

  reviewForm?.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") validateField(field);
      if (formMessage) formMessage.hidden = true;
      checkForValidSweep();
    });
    field.addEventListener("change", () => {
      updateReviewSummary();
      if (field.type !== "radio" && field.getAttribute("aria-invalid") === "true") validateField(field);
      if (formMessage) formMessage.hidden = true;
      checkForValidSweep();
    });
  });

  updateReviewSummary();

  function handlePreviewForm(event) {
    event.preventDefault();
    // Intentionally disabled for this mockup: no information is transmitted or stored.
    if (!reviewForm) return;
    if (formMessage) formMessage.hidden = true;

    const fields = [...reviewForm.querySelectorAll("input, select, textarea")].filter(
      (field) => field.type !== "radio" || field.checked
    );
    const invalidFields = fields.filter((field) => !validateField(field));

    if (invalidFields.length) {
      if (errorSummary) {
        errorSummary.hidden = false;
        errorSummary.textContent = `Please check ${invalidFields.length === 1 ? "the highlighted field" : "the highlighted fields"} before continuing.`;
        errorSummary.focus();
      }
      return;
    }

    if (errorSummary) errorSummary.hidden = true;
    if (formMessage) formMessage.hidden = false;
  }

  reviewForm?.addEventListener("submit", handlePreviewForm);
  if (formSubmit) {
    formSubmit.type = "submit";
    formSubmit.disabled = false;
  }

  /* Show the mobile CTA after the hero, then clear it around the form and footer. */
  const mobileCta = document.querySelector("[data-mobile-cta]");
  const hero = document.querySelector(".hero");
  const processSection = document.querySelector(".process-section");
  const ryanSection = document.querySelector(".ryan-section");
  const testimonialSection = document.querySelector(".testimonials");
  const requestSection = document.querySelector(".request-section");
  const siteFooter = document.querySelector("[data-site-footer]");
  let heroPassed = false;
  let processVisible = false;
  let ryanVisible = false;
  let testimonialsVisible = false;
  let requestVisible = false;
  let footerVisible = false;

  function updateMobileCta() {
    mobileCta?.classList.toggle("is-visible", heroPassed && !processVisible && !ryanVisible && !testimonialsVisible && !requestVisible && !footerVisible);
  }

  if ("IntersectionObserver" in window && mobileCta && hero) {
    new IntersectionObserver(([entry]) => {
      heroPassed = !entry.isIntersecting && entry.boundingClientRect.bottom < 90;
      updateMobileCta();
    }).observe(hero);

    const exclusionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === processSection) processVisible = entry.isIntersecting;
        if (entry.target === ryanSection) ryanVisible = entry.isIntersecting;
        if (entry.target === testimonialSection) testimonialsVisible = entry.isIntersecting;
        if (entry.target === requestSection) requestVisible = entry.isIntersecting;
        if (entry.target === siteFooter) footerVisible = entry.isIntersecting;
      });
      updateMobileCta();
    }, { threshold: 0.01 });
    if (processSection) exclusionObserver.observe(processSection);
    if (ryanSection) exclusionObserver.observe(ryanSection);
    if (testimonialSection) exclusionObserver.observe(testimonialSection);
    if (requestSection) exclusionObserver.observe(requestSection);
    if (siteFooter) exclusionObserver.observe(siteFooter);
  }

  if (menuOpen) menuOpen.disabled = false;
  root.classList.add("is-enhanced");
})();
