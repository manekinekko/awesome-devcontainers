export const categories = ["Tools", "Articles", "Tutorials", "Videos", "Samples", "AI"];

export function plainText(markdown) {
  return markdown
    .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .trim();
}

export function parseResources(markdown) {
  const resources = [];
  let category = "";
  let language = "";

  for (const line of markdown.split(/\r?\n/)) {
    const section = line.match(/^## (.+)$/);
    if (section) {
      category = categories.includes(section[1]) ? section[1] : "";
      language = "";
      continue;
    }

    const subsection = line.match(/^### (.+)$/);
    if (subsection && category === "Samples") {
      language = subsection[1];
      continue;
    }

    const resource = line.match(/^- \[([^\]]+)\]\((https?:\/\/[^)]+)\)(.*)$/);
    if (!category || !resource) continue;

    const [, title, url, remainder] = resource;
    const alternate = remainder.match(/^\s*\|\s*\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
    const description = plainText(
      remainder.slice(alternate?.[0].length ?? 0).replace(/^\s*(?:-|—|:)\s*/, ""),
    );
    const parsedUrl = new URL(url);
    if (!["https:", "http:"].includes(parsedUrl.protocol)) {
      throw new Error(`Unsupported resource URL: ${url}`);
    }

    resources.push({
      id: `resource-${resources.length + 1}`,
      title: plainText(title),
      url,
      description,
      category,
      language,
      alternate: alternate ? { title: alternate[1], url: alternate[2] } : null,
    });
  }

  if (!resources.length) throw new Error("No resources found in README.md.");
  for (const category of categories) {
    if (!resources.some((resource) => resource.category === category)) {
      throw new Error(`README.md has no resources in ${category}.`);
    }
  }
  return resources;
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

export function serializeData(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
