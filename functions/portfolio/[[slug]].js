export async function onRequest(context) {
  const { request, env, params } = context;

  const slug = Array.isArray(params.slug)
    ? params.slug.join("/")
    : (params.slug || "");

  // Prevent the shared template itself
  // from being handled as a project slug.
  if (
    slug === "project" ||
    slug === "project.html"
  ) {
    return env.ASSETS.fetch(request);
  }

  if (!slug) {
    return env.ASSETS.fetch(request);
  }

  const url = new URL(request.url);

  url.pathname = "/portfolio/project.html";
  url.searchParams.set("slug", slug);

  const assetRequest = new Request(
    url.toString(),
    request
  );

  return env.ASSETS.fetch(assetRequest);
}
