import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { categories, escapeHtml, parseResources, serializeData } from "../scripts/resources.mjs";
import { filtersUrl, readFilters, selectResources, starterUrls } from "../website/catalog.mjs";
import { updateGitHubStars } from "../website/github-stars.mjs";
import { buildSite } from "../scripts/build.mjs";

const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
const resources = parseResources(readme);
const defaults = { query: "", category: "All", language: "", sort: "curated" };

test("includes every resource, but not the contents list or website documentation", () => {
  const resourceSection = readme.slice(readme.indexOf("## Tools"), readme.indexOf("## Website"));
  const expected = resourceSection.split("\n").filter((line) => /^- \[/.test(line)).length;
  assert.equal(resources.length, expected);
  assert.deepEqual([...new Set(resources.map((resource) => resource.category))], categories);
  assert.equal(new Set(resources.map((resource) => resource.id)).size, resources.length);
  assert.equal(resources.some((resource) => resource.url.startsWith("#")), false);
});

test("preserves descriptions with inline links, backticks, alternate URLs, and colon separators", () => {
  const tyedev = resources.find((resource) => resource.title === "tyedev");
  assert.match(tyedev.description, /search for features and templates/);
  const devsy = resources.find((resource) => resource.title === "Devsy");
  assert.equal(devsy.alternate.url, "https://devsy.sh/");
  assert.match(devsy.description, /^Accelerate/);
  assert.match(resources.find((resource) => resource.title === "Python Project Template").description, /^A Dev Container/);
  assert.match(resources.find((resource) => resource.title === "Pieces").description, /^An on-device/);
  assert.match(resources.find((resource) => resource.title === "crib").description, /docker exec/);
});

test("parses CRLF and rejects missing source categories", () => {
  assert.deepEqual(parseResources(readme.replace(/\n/g, "\r\n")), resources);
  assert.throws(() => parseResources("# No resources"), /No resources/);
  assert.throws(() => parseResources("## Tools\n- [Tool](https://example.com) - A tool."), /Articles/);
});

test("curated order starts with actual getting-started resources", () => {
  assert.deepEqual(selectResources(resources, defaults).slice(0, 3).map((resource) => resource.url), starterUrls);
});

test("filters by category, language, and all case-insensitive search terms", () => {
  const selected = selectResources(resources, { ...defaults, category: "Samples", language: "Python", query: "POSTGRESQL pgvector" });
  assert.equal(selected.length, 1);
  assert.equal(selected[0].title, "PostgreSQL + pgvector playground");
  assert.equal(selectResources(resources, { ...defaults, category: "Tools" }).length,
    resources.filter((resource) => resource.category === "Tools").length);
  assert.equal(selectResources(resources, { ...defaults, query: "  \n  " }).length, resources.length);
  assert.equal(selectResources(resources, { ...defaults, query: "no-such-resource-123" }).length, 0);
});

test("alphabetical sorting is deterministic and does not mutate the source", () => {
  const original = resources.map((resource) => resource.id);
  const sorted = selectResources(resources, { ...defaults, sort: "az" });
  assert.deepEqual(sorted.map((resource) => resource.title),
    [...resources].map((resource) => resource.title).sort((a, b) => a.localeCompare(b, "en")));
  assert.deepEqual(resources.map((resource) => resource.id), original);
});

test("filter URLs preserve GitHub Pages base paths, themes, and anchors", () => {
  const state = { ...defaults, category: "Samples", language: "C/C++", query: "c++ tools", sort: "az" };
  const url = filtersUrl("https://manekinekko.github.io/awesome-devcontainers/?scoutTheme=dark#collection", state);
  assert.equal(url.pathname, "/awesome-devcontainers/");
  assert.equal(url.searchParams.get("scoutTheme"), "dark");
  assert.equal(url.hash, "#collection");
  assert.deepEqual(readFilters(url.search, resources), state);
  const reset = filtersUrl(url.href, defaults);
  assert.equal(reset.search, "?scoutTheme=dark");
  assert.deepEqual(readFilters("?category=invalid&language=Python&sort=bad", resources), defaults);
  assert.equal(readFilters("?category=Tools&language=Python", resources).language, "");
});

test("HTML and JSON serialization keep resource content inert", () => {
  assert.equal(escapeHtml('<a href="x">&'), "&lt;a href=&quot;x&quot;&gt;&amp;");
  const malicious = { title: "</script><script>alert(1)</script>" };
  const json = serializeData(malicious);
  assert.equal(json.includes("</script>"), false);
  assert.deepEqual(JSON.parse(json), malicious);
});

test("theme initializes before paint with URL, saved, and system preference precedence", async () => {
  const template = await readFile(new URL("../website/index.html", import.meta.url), "utf8");
  const script = template.match(/<script>([\s\S]*?)<\/script>/)[1];
  for (const [search, saved, systemDark, expected] of [
    ["", null, false, "light"],
    ["", null, true, "dark"],
    ["", "light", true, "light"],
    ["", "dark", false, "dark"],
    ["?scoutTheme=light", "dark", true, "light"],
    ["?scoutTheme=dark", "light", false, "dark"],
    ["?scoutTheme=invalid", "invalid", true, "dark"],
  ]) {
    const element = { dataset: {}, setAttribute(name, value) { this[name] = value; } };
    runInNewContext(script, {
      document: { documentElement: element },
      window: { location: { search }, matchMedia: () => ({ matches: systemDark }) },
      localStorage: { getItem: () => saved },
      URLSearchParams,
    });
    assert.equal(element["data-theme"], expected);
  }
  let warnings = 0;
  const element = { dataset: {}, setAttribute(name, value) { this[name] = value; } };
  runInNewContext(script, {
    document: { documentElement: element },
    window: { location: { search: "" }, matchMedia: () => ({ matches: true }) },
    localStorage: { getItem() { throw new Error("Storage denied"); } },
    console: { warn() { warnings += 1; } },
    URLSearchParams,
  });
  assert.equal(element["data-theme"], "dark");
  assert.equal(warnings, 1);
});

test("both palettes meet AA contrast for text and primary buttons", async () => {
  const css = await readFile(new URL("../website/site.css", import.meta.url), "utf8");
  const blocks = [css.match(/:root \{([^}]+)\}/)[1], css.match(/html\[data-theme="dark"\] \{([^}]+)\}/)[1]];
  const luminance = (hex) => {
    const channels = hex.match(/[a-f0-9]{2}/gi).map((channel) => {
      const value = parseInt(channel, 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  for (const block of blocks) {
    const tokens = Object.fromEntries([...block.matchAll(/--cp-([\w-]+): (#[a-f0-9]{6});/gi)].map((match) => [match[1], match[2]]));
    const assertContrast = (text, background) => {
      const values = [luminance(tokens[text]), luminance(tokens[background])].sort((a, b) => b - a);
      const ratio = (values[0] + 0.05) / (values[1] + 0.05);
      assert.ok(ratio >= 4.5, `${text} on ${background} (${tokens[background]}): ${ratio.toFixed(2)}:1`);
    };
    for (const text of ["text", "text-muted", "text-soft", "accent"]) {
      for (const background of ["bg", "bg-elevated", "surface"]) assertContrast(text, background);
    }
    assertContrast("accent-fg", "accent");
  }
});

function setLinkAttribute(name, value) {
  this[name] = value;
}

function githubHeader() {
  return {
    link: {
      href: "https://github.com/manekinekko/awesome-devcontainers",
      "aria-label": "View on GitHub (opens in a new tab)",
      title: "",
      dataset: {},
      setAttribute: setLinkAttribute,
    },
    countElement: { textContent: "" },
  };
}

test("GitHub stars format valid counts, including zero, with an exact accessible label", async (t) => {
  const requests = [];
  let count;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    requests.push({ url, options });
    return { ok: true, json: async () => ({ stargazers_count: count }) };
  });
  const warn = t.mock.method(console, "warn", () => {});
  t.mock.timers.enable({ apis: ["setTimeout"] });
  for (const [value, visible, full] of [
    [0, "0", "0 stars"],
    [1, "1", "1 star"],
    [999, "999", "999 stars"],
    [1234, "1.23K", "1,234 stars"],
    [12345, "12.3K", "12,345 stars"],
    [1234567, "1.23M", "1,234,567 stars"],
    [Number.MAX_SAFE_INTEGER, "9010T", "9,007,199,254,740,991 stars"],
  ]) {
    count = value;
    const { link, countElement } = githubHeader();
    await updateGitHubStars(link, countElement);
    assert.equal(countElement.textContent, visible);
    assert.equal(link.dataset.starsLoaded, "true");
    assert.equal(link["aria-label"], `View on GitHub: manekinekko/awesome-devcontainers, ${full} (opens in a new tab)`);
    assert.equal(link.title, `${full} on GitHub`);
    assert.equal(link.href, "https://github.com/manekinekko/awesome-devcontainers");
  }
  t.mock.timers.tick(5000);
  for (const { url, options } of requests) {
    assert.equal(url, "https://api.github.com/repos/manekinekko/awesome-devcontainers");
    assert.deepEqual(options.headers, { Accept: "application/vnd.github+json" });
    assert.equal(options.credentials, "omit");
    assert.equal(options.signal.aborted, false, "clears the timeout after success");
  }
  assert.equal(warn.mock.callCount(), 0);
});

test("GitHub stars reject malformed payloads without inventing a count or changing the link", async (t) => {
  let payload;
  t.mock.method(globalThis, "fetch", async () => ({ ok: true, json: async () => payload }));
  const warn = t.mock.method(console, "warn", () => {});
  const invalid = [null, {}, [], "invalid",
    ...[undefined, null, "123", true, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]
      .map((stargazers_count) => ({ stargazers_count }))];
  for (payload of invalid) {
    const header = githubHeader();
    await updateGitHubStars(header.link, header.countElement);
    assert.deepEqual(header, githubHeader());
  }
  assert.equal(warn.mock.callCount(), invalid.length);
  for (const { arguments: [message, error] } of warn.mock.calls) {
    assert.match(message, /GitHub star count unavailable/);
    assert.match(error.message, /invalid stargazers_count; expected a nonnegative safe integer/);
  }
});

test("GitHub stars handle HTTP, network, and JSON errors with a precise warning", async (t) => {
  const networkError = new TypeError("Failed to fetch");
  const jsonError = new SyntaxError("Unexpected token in JSON");
  const scenarios = [
    ...[403, 404, 429, 500].map((status) => ({
      fetch: async () => ({ ok: false, status, json() { assert.fail("must not parse an HTTP error"); } }),
      message: `GitHub API returned HTTP ${status}.`,
    })),
    { fetch: async () => { throw networkError; }, message: networkError.message },
    { fetch: async () => ({ ok: true, json: async () => { throw jsonError; } }), message: jsonError.message },
  ];
  for (const scenario of scenarios) {
    await t.test(scenario.message, async (t) => {
      let signal;
      t.mock.method(globalThis, "fetch", (url, options) => {
        signal = options.signal;
        return scenario.fetch();
      });
      const warn = t.mock.method(console, "warn", () => {});
      t.mock.timers.enable({ apis: ["setTimeout"] });
      const header = githubHeader();
      await updateGitHubStars(header.link, header.countElement);
      assert.deepEqual(header, githubHeader());
      assert.equal(warn.mock.callCount(), 1);
      assert.match(warn.mock.calls[0].arguments[0], /GitHub star count unavailable/);
      assert.equal(warn.mock.calls[0].arguments[1].message, scenario.message);
      t.mock.timers.tick(5000);
      assert.equal(signal.aborted, false, "clears the timeout after failure");
    });
  }
});

test("GitHub stars abort a stalled request or response body after five seconds", async (t) => {
  for (const phase of ["request", "body"]) {
    await t.test(phase, async (t) => {
      let signal;
      t.mock.method(globalThis, "fetch", (url, options) => {
        signal = options.signal;
        const stalled = () => new Promise((resolve, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason), { once: true });
        });
        return phase === "request" ? stalled() : { ok: true, json: stalled };
      });
      const warn = t.mock.method(console, "warn", () => {});
      t.mock.timers.enable({ apis: ["setTimeout"] });
      const header = githubHeader();
      const pending = updateGitHubStars(header.link, header.countElement);
      await Promise.resolve();
      t.mock.timers.tick(4999);
      assert.equal(signal.aborted, false);
      assert.deepEqual(header, githubHeader(), "keeps navigation available while the count is pending");
      t.mock.timers.tick(1);
      await pending;
      assert.equal(signal.aborted, true);
      assert.deepEqual(header, githubHeader());
      assert.equal(warn.mock.callCount(), 1);
      assert.match(warn.mock.calls[0].arguments[0], /GitHub star count request timed out after 5 seconds/);
    });
  }
});

test("build produces a self-contained, pre-rendered GitHub Pages site", async () => {
  const { output, count } = await buildSite();
  const html = await readFile(`${output}/index.html`, "utf8");
  assert.equal(count, resources.length);
  assert.equal((html.match(/data-resource-id=/g) || []).length, resources.length);
  assert.equal(/\{\{[A-Z_]+\}\}/.test(html), false);
  assert.equal(/<script[^>]+src=/.test(html), false);
  assert.equal(/<link[^>]+rel="stylesheet"/.test(html), false);
  assert.equal(/(?:href|src)="\/[^/]/.test(html), false);
  const githubLink = html.match(/<a class="github-link"[\s\S]*?<\/a>/)[0];
  assert.match(githubLink, /href="https:\/\/github.com\/manekinekko\/awesome-devcontainers"/);
  assert.match(githubLink, /aria-label="View on GitHub \(opens in a new tab\)"/);
  assert.match(githubLink, /class="github-stars" aria-hidden="true"/);
  assert.match(githubLink, /id="github-star-count"><\/span>/);
  assert.doesNotMatch(githubLink, /data-stars-loaded/);
  assert.match(html, /async function updateGitHubStars/);
  assert.match(html, /render\(\);\nsyncTheme\(\);\nvoid updateGitHubStars\(document.getElementById\("github-link"\), document.getElementById\("github-star-count"\)\);\n<\/script>/);
  const data = html.match(/<script type="application\/json" id="resource-data">(.+)<\/script>/)[1];
  assert.deepEqual(JSON.parse(data), resources);
  const config = html.match(/<code id="config-code">([\s\S]*?)<\/code>/)[1].replace(/<[^>]+>/g, "");
  assert.doesNotThrow(() => JSON.parse(config));
  assert.equal(await readFile(`${output}/.nojekyll`, "utf8"), "");
});
