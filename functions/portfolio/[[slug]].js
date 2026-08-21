export async function onRequest(context) {
  const { request, env, params } = context;

  const slug = Array.isArray(params.slug)
    ? params.slug.join("/")
    : params.slug || "";

  // /portfolio/ itself should continue using portfolio/index.html
  if (!slug) {
    return env.ASSETS.fetch(request);
  }

  // Internally serve the shared project template.
  // Browser URL stays /portfolio/denn/
  const url = new URL(request.url);

  url.pathname = "/portfolio/project.html";
  url.searchParams.set("slug", slug);

  const assetRequest = new Request(url.toString(), request);

  return env.ASSETS.fetch(assetRequest);
}
