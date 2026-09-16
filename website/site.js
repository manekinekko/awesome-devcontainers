const resources = JSON.parse(document.getElementById("resource-data").textContent);
const grid = document.getElementById("resource-grid");
const cards = new Map([...grid.children].map((card) => [card.dataset.resourceId, card]));
const search = document.getElementById("resource-search");
const sort = document.getElementById("resource-sort");
const categoryButtons = [...document.querySelectorAll("[data-category]")];
const languageButtons = [...document.querySelectorAll("[data-language]")];
let filters = readFilters(window.location.search, resources);
const pageSize = 12;
let visibleLimit = pageSize;

document.documentElement.classList.add("has-js");
for (const id of ["resource-filters", "search-controls", "sort-control", "theme-toggle", "copy-config"]) {
  document.getElementById(id).hidden = false;
}

function render() {
  const selected = selectResources(resources, filters);
  const displayed = selected.slice(0, visibleLimit);
  const visible = new Set(displayed.map((resource) => resource.id));
  for (const [id, card] of cards) card.hidden = !visible.has(id);
  for (const resource of displayed) grid.append(cards.get(resource.id));

  search.value = filters.query;
  sort.value = filters.sort;
  for (const button of categoryButtons) {
    const active = button.dataset.category === filters.category;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }
  for (const button of languageButtons) {
    const active = button.dataset.language === filters.language;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }
  const title = filters.language
    ? `${filters.language} samples`
    : filters.category === "All" ? "All resources" : filters.category;
  const resultCount = document.getElementById("result-count");
  resultCount.querySelector("strong").textContent = title;
  resultCount.querySelector("span").textContent = `${selected.length} ${selected.length === 1 ? "resource" : "resources"}${filters.query ? " found" : " worth exploring"}`;
  document.getElementById("empty-state").hidden = selected.length !== 0;
  document.getElementById("load-more").hidden = selected.length === 0;
  document.getElementById("show-more").hidden = displayed.length === selected.length;
  document.getElementById("displayed-count").textContent = `Showing ${displayed.length} of ${selected.length} resources`;
  const hasFilters = Boolean(filters.query || filters.category !== "All" || filters.language);
  document.getElementById("active-filters").hidden = !hasFilters;
  document.getElementById("filter-description").textContent =
    [filters.category !== "All" ? filters.category : "", filters.language, filters.query ? `Search: "${filters.query}"` : ""].filter(Boolean).join(" / ");
}

function updateFilters(changes, historyMode = "push") {
  filters = { ...filters, ...changes };
  if (Object.keys(changes).length) visibleLimit = pageSize;
  const url = filtersUrl(window.location.href, filters);
  if (url.href !== window.location.href) {
    if (historyMode === "replace") window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
  }
  render();
}

let searchTimer;
search.addEventListener("input", () => {
  clearTimeout(searchTimer);
  filters.query = search.value;
  visibleLimit = pageSize;
  render();
  searchTimer = setTimeout(() => updateFilters({}, "replace"), 200);
});
search.addEventListener("search", () => updateFilters({ query: search.value }, "replace"));
sort.addEventListener("change", () => updateFilters({ sort: sort.value }));
for (const button of categoryButtons) {
  button.addEventListener("click", () => updateFilters({ category: button.dataset.category, language: "" }));
}
for (const button of languageButtons) {
  button.addEventListener("click", () => updateFilters({
    category: "Samples",
    language: filters.language === button.dataset.language ? "" : button.dataset.language,
  }));
}
for (const id of ["clear-filters", "reset-search"]) {
  document.getElementById(id).addEventListener("click", () => {
    updateFilters({ query: "", category: "All", language: "", sort: "curated" });
    search.focus({ preventScroll: true });
  });
}
document.getElementById("browse-samples").addEventListener("click", (event) => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  updateFilters({ query: "", category: "Samples", language: "" });
  window.location.hash = "collection";
  search.focus({ preventScroll: true });
});
window.addEventListener("popstate", () => {
  clearTimeout(searchTimer);
  filters = readFilters(window.location.search, resources);
  visibleLimit = pageSize;
  render();
  syncTheme();
});
document.getElementById("show-more").addEventListener("click", () => {
  const nextResource = selectResources(resources, filters)[visibleLimit];
  visibleLimit += pageSize;
  render();
  if (nextResource) cards.get(nextResource.id).querySelector("h3 a").focus({ preventScroll: true });
});
document.addEventListener("keydown", (event) => {
  const editing = event.target instanceof HTMLElement
    && (event.target.closest("input, textarea, select") || event.target.isContentEditable);
  if (event.key === "/" && !editing && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    search.focus();
    search.scrollIntoView({ block: "center" });
  }
  if (event.key === "Escape" && document.activeElement === search) {
    updateFilters({ query: "" }, "replace");
  }
});

const themeToggle = document.getElementById("theme-toggle");
const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
function syncTheme() {
  const param = new URLSearchParams(window.location.search).get("scoutTheme");
  document.documentElement.dataset.theme = ["light", "dark"].includes(param)
    ? param : document.documentElement.dataset.savedTheme || (colorScheme.matches ? "dark" : "light");
  updateThemeButton();
}
function updateThemeButton() {
  const isDark = document.documentElement.dataset.theme === "dark";
  themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
  themeToggle.title = themeToggle.getAttribute("aria-label");
  themeToggle.querySelector("use").setAttribute("href", `#icon-${isDark ? "sun" : "moon"}`);
}
themeToggle.addEventListener("click", () => {
  const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.savedTheme = theme;
  try {
    localStorage.setItem("awesome-devcontainers-theme", theme);
  } catch (error) {
    console.warn("Couldn't save the theme preference; the current URL preserves this choice.", error);
  }
  const url = new URL(window.location.href);
  url.searchParams.set("scoutTheme", theme);
  window.history.replaceState(null, "", url);
  updateThemeButton();
});
colorScheme.addEventListener("change", (event) => {
  const param = new URLSearchParams(window.location.search).get("scoutTheme");
  if (["light", "dark"].includes(param) || document.documentElement.dataset.savedTheme) return;
  document.documentElement.dataset.theme = event.matches ? "dark" : "light";
  updateThemeButton();
});

const copyButton = document.getElementById("copy-config");
const copyStatus = document.getElementById("copy-status");
copyButton.addEventListener("click", async () => {
  copyButton.disabled = true;
  try {
    await navigator.clipboard.writeText(document.getElementById("config-code").textContent);
    copyStatus.textContent = "Copied. Save as .devcontainer/devcontainer.json";
    copyButton.querySelector("use").setAttribute("href", "#icon-check");
  } catch (error) {
    console.error("Could not copy devcontainer configuration:", error);
    copyStatus.textContent = "Couldn't copy automatically. Select the code above and copy it manually.";
  } finally {
    copyButton.disabled = false;
  }
});

render();
syncTheme();
