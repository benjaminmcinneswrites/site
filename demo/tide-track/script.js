document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const route = document.querySelector(".route-map");
const motionGroups = [
  ...document.querySelectorAll(".trip-grid > *, .safety-grid > *, .sea-cta > *"),
];

motionGroups.forEach((item, index) => {
  item.classList.add("sea-motion");
  item.style.setProperty("--sea-delay", `${Math.min(index % 3, 2) * 90}ms`);
});

requestAnimationFrame(() => document.documentElement.classList.add("sea-ready"));

const showEverything = () => {
  route?.classList.add("is-visible");
  motionGroups.forEach((item) => item.classList.add("is-in"));
};

if (reducedMotion || !("IntersectionObserver" in window)) {
  showEverything();
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add(entry.target === route ? "is-visible" : "is-in");
      observer.unobserve(entry.target);
    });
  }, { threshold: .18, rootMargin: "0px 0px -8%" });

  if (route) observer.observe(route);
  motionGroups.forEach((item) => observer.observe(item));
  window.setTimeout(showEverything, 2200);
}
