export const starterUrls = [
  "https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack",
  "https://code.visualstudio.com/docs/remote/containers",
  "https://docs.microsoft.com/en-us/learn/modules/use-docker-container-dev-env-vs-code/?WT.mc_id=devcloud-11496-cxa",
];

export function readFilters(search, resources) {
  const params = new URLSearchParams(search);
  const category = params.get("category") || "All";
  const language = params.get("language") || "";
  return {
    query: params.get("q") || "",
    category: resources.some((resource) => resource.category === category) ? category : "All",
    language: category === "Samples" && resources.some((resource) => resource.language === language)
      ? language
      : "",
    sort: params.get("sort") === "az" ? "az" : "curated",
  };
}

export function selectResources(resources, filters) {
  const terms = filters.query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const filtered = resources.filter((resource) => {
    const haystack = [
      resource.title, resource.description, resource.category, resource.language,
      resource.url, resource.alternate?.title || "",
    ].join(" ").toLocaleLowerCase();
    return (filters.category === "All" || resource.category === filters.category)
      && (!filters.language || resource.language === filters.language)
      && terms.every((term) => haystack.includes(term));
  });

  return filtered.sort((a, b) => {
    if (filters.sort === "az") return a.title.localeCompare(b.title, "en");
    const priority = (resource) => {
      const index = starterUrls.indexOf(resource.url);
      return index < 0 ? starterUrls.length : index;
    };
    return priority(a) - priority(b);
  });
}

export function filtersUrl(href, filters) {
  const url = new URL(href);
  const values = {
    q: filters.query,
    category: filters.category === "All" ? "" : filters.category,
    language: filters.language,
    sort: filters.sort === "curated" ? "" : filters.sort,
  };
  for (const [key, value] of Object.entries(values)) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  return url;
}
