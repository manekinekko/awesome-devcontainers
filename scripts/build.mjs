import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { categories, escapeHtml, parseResources, serializeData } from "./resources.mjs";
import { selectResources, starterUrls } from "../website/catalog.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const iconNames = {
  All: "grid", Tools: "terminal", Articles: "file", Tutorials: "book",
  Videos: "play", Samples: "code",
};
const icon = (name, className = "") =>
  `<svg class="icon ${className}" aria-hidden="true"><use href="#icon-${name}"></use></svg>`;

function renderCard(resource) {
  const { id, title, description, category, language, url, alternate } = resource;
  const isStarter = starterUrls.includes(url);
  const hostname = new URL(url).hostname.replace(/^www\./, "");
  return `<article class="resource-card${isStarter ? " starter-card" : ""}" id="${id}" data-resource-id="${id}">
    <div class="card-top">
      <span class="resource-icon">${icon(iconNames[category])}</span>
      <span class="card-kind">${isStarter ? "START HERE" : escapeHtml(language || category)}</span>
    </div>
    <h3><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}<span class="sr-only"> (opens in a new tab)</span></a></h3>
    <p>${escapeHtml(description)}</p>
    <div class="card-bottom">
      <span class="source-domain">${escapeHtml(hostname)}</span>
      ${alternate ? `<a class="alternate-link" href="${escapeHtml(alternate.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(title)} website (opens in a new tab)">Website</a>` : ""}
      ${icon("arrow-up-right")}
    </div>
  </article>`;
}

export async function buildSite() {
  const read = (path) => readFile(resolve(root, path), "utf8");
  const markdown = await read("README.md");
  const template = await read("website/index.html");
  const css = await read("website/site.css");
  const catalog = await read("website/catalog.mjs");
  const app = await read("website/site.js");
  const resources = parseResources(markdown);
  const languages = [...new Set(resources.map((resource) => resource.language).filter(Boolean))];
  const ordered = selectResources(resources, {
    query: "", category: "All", language: "", sort: "curated",
  });
  const categoryButtons = ["All", ...categories].map((category) => {
    const count = category === "All" ? resources.length
      : resources.filter((resource) => resource.category === category).length;
    return `<button type="button" class="category-button${category === "All" ? " active" : ""}" data-category="${category}" aria-pressed="${category === "All"}">
      ${icon(iconNames[category])}<span>${category === "All" ? "All resources" : category}</span><span class="category-count">${count}</span>
    </button>`;
  }).join("\n");
  const languageButtons = languages.map((language) =>
    `<button type="button" class="language-button" data-language="${escapeHtml(language)}" aria-pressed="false">${escapeHtml(language)}</button>`,
  ).join("\n");
  const replacements = {
    STYLES: css,
    RESOURCE_COUNT: String(resources.length),
    LANGUAGE_COUNT: String(languages.length),
    CATEGORY_BUTTONS: categoryButtons,
    LANGUAGE_BUTTONS: languageButtons,
    CARDS: ordered.map(renderCard).join("\n"),
    RESOURCE_DATA: serializeData(resources),
    SCRIPT: `${catalog.replace(/^export /gm, "")}\n${app}`,
  };
  const html = template.replace(/\{\{([A-Z_]+)\}\}/g, (match, key) => {
    if (!(key in replacements)) throw new Error(`Unknown template token: ${match}`);
    return replacements[key];
  });
  const output = resolve(root, "dist");
  await mkdir(output, { recursive: true });
  await writeFile(resolve(output, "index.html"), html);
  await writeFile(resolve(output, ".nojekyll"), "");
  return { count: resources.length, output };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { count, output } = await buildSite();
  console.log(`Built ${count} resources into ${output}/index.html`);
}
