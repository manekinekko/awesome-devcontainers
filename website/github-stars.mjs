export async function updateGitHubStars(link, countElement) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  let count;
  try {
    const response = await fetch("https://api.github.com/repos/manekinekko/awesome-devcontainers", {
      headers: { Accept: "application/vnd.github+json" },
      credentials: "omit",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`GitHub API returned HTTP ${response.status}.`);
    const payload = await response.json();
    count = payload?.stargazers_count;
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new TypeError("GitHub API returned an invalid stargazers_count; expected a nonnegative safe integer.");
    }
  } catch (error) {
    console.warn(controller.signal.aborted
      ? "GitHub star count request timed out after 5 seconds; keeping the repository link."
      : "GitHub star count unavailable; keeping the repository link.", error);
    return;
  } finally {
    clearTimeout(timeout);
  }

  const fullCount = new Intl.NumberFormat("en").format(count);
  const stars = `${fullCount} ${count === 1 ? "star" : "stars"}`;
  countElement.textContent = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumSignificantDigits: 3,
  }).format(count);
  link.setAttribute("aria-label", `View on GitHub: manekinekko/awesome-devcontainers, ${stars} (opens in a new tab)`);
  link.title = `${stars} on GitHub`;
  link.dataset.starsLoaded = "true";
}
