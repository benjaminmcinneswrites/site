document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const graph = document.querySelector(".start-graph");
const monthBoard = document.querySelector(".month-board");
const ledgerTargets = [
  ...document.querySelectorAll(".service-table article, .month-cards article"),
  monthBoard,
  document.querySelector(".scope-grid"),
  graph,
].filter(Boolean);

ledgerTargets.forEach((item, index) => {
  item.classList.add("ledger-motion");
  item.style.setProperty("--ledger-delay", `${Math.min(index % 4, 3) * 75}ms`);
});

requestAnimationFrame(() => document.documentElement.classList.add("ledger-ready"));

const showLedger = () => {
  ledgerTargets.forEach((item) => item.classList.add("is-in"));
  graph?.classList.add("in");
};

if (reducedMotion || !("IntersectionObserver" in window)) {
  showLedger();
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      if (entry.target === graph) graph.classList.add("in");
      observer.unobserve(entry.target);
    });
  }, { threshold: .18, rootMargin: "0px 0px -8%" });

  ledgerTargets.forEach((item) => observer.observe(item));
  window.setTimeout(showLedger, 2400);
}
