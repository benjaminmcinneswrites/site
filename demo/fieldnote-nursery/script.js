document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fieldTargets = [
  document.querySelector(".section-head"),
  ...document.querySelectorAll(".species-photo, .selection-note, .specimen, .project-copy li, .project-section aside, .visit-card"),
].filter(Boolean);

fieldTargets.forEach((item, index) => {
  item.classList.add("field-motion");
  item.style.setProperty("--field-delay", `${Math.min(index % 3, 2) * 80}ms`);
});

requestAnimationFrame(() => document.documentElement.classList.add("field-ready"));

const revealField = () => fieldTargets.forEach((item) => item.classList.add("in"));

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealField();
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      observer.unobserve(entry.target);
    });
  }, { threshold: .15, rootMargin: "0px 0px -7%" });

  fieldTargets.forEach((item) => observer.observe(item));
  window.setTimeout(revealField, 2200);
}
