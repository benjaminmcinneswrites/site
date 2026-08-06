(function () {
  "use strict";

  const source = document.querySelector("[data-legal-copy]");
  if (!source) return;

  const chapterHeadings = new Map([
    ["KiwiGrowth Privacy Policy", "privacy-policy"],
    ["KiwiGrowth Disclosure", "public-disclosure"],
  ]);

  const sectionHeadings = new Set([
    "Our Commitment to Your Privacy",
    "Information We Collect",
    "Security",
    "Use of Your Personal Information",
    "Disclosing Your Personal Information",
    "Cookies",
    "Third-Party Cookies and Technologies",
    "Additional Information We Collect",
    "Links to Other Websites",
    "Updates to Our Privacy Policy",
    "Complaints and Contact Information",
    "Nature and Scope of My Advice",
    "Conflicts of Interest or Incentives",
    "Internal Complaints",
    "Dispute Resolution Scheme",
    "Our Duties",
  ]);

  const minorHeadings = new Set([
    "Personal Information Provided by You:",
    "Information Collected Automatically:",
    "Third-Party Services We Utilise Include:",
  ]);

  const documentElement = document.createElement("article");
  documentElement.className = "legal-document";
  documentElement.setAttribute("aria-label", "KiwiGrowth privacy policy and public disclosure");

  let chapter = null;
  let list = null;

  const ensureChapter = () => {
    if (chapter) return chapter;
    chapter = document.createElement("section");
    chapter.className = "legal-document__chapter";
    documentElement.append(chapter);
    return chapter;
  };

  source.textContent.replace(/\r/g, "").split("\n").forEach((line) => {
    const text = line.trim();
    if (!text || text === "​") {
      list = null;
      return;
    }

    if (chapterHeadings.has(text)) {
      chapter = document.createElement("section");
      chapter.className = "legal-document__chapter";
      chapter.id = chapterHeadings.get(text);
      const heading = document.createElement("h2");
      heading.textContent = text;
      chapter.append(heading);
      documentElement.append(chapter);
      list = null;
      return;
    }

    if (sectionHeadings.has(text) || minorHeadings.has(text)) {
      const heading = document.createElement(minorHeadings.has(text) ? "h4" : "h3");
      heading.textContent = text;
      ensureChapter().append(heading);
      list = null;
      return;
    }

    if (text.startsWith("•")) {
      if (!list) {
        list = document.createElement("ul");
        ensureChapter().append(list);
      }
      const item = document.createElement("li");
      item.textContent = text.slice(1).trim();
      list.append(item);
      return;
    }

    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    ensureChapter().append(paragraph);
    list = null;
  });

  source.hidden = true;
  source.insertAdjacentElement("afterend", documentElement);
})();
