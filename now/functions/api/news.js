const FEEDS = [
  {
    source: "CANADA",
    url:
      "https://news.google.com/rss?hl=en-CA&gl=CA&ceid=CA:en"
  },

  {
    source: "WORLD",
    url:
      "https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-CA&gl=CA&ceid=CA:en"
  }
];


export async function onRequestGet() {

  try {

    const results =
      await Promise.all(
        FEEDS.map(
          feed =>
            loadFeed(feed)
        )
      );


    const headlines =
      results
        .flat()
        .slice(0, 15);


    return Response.json(
      headlines,
      {
        headers: {
          "Cache-Control":
            "public, max-age=600"
        }
      }
    );

  }

  catch (error) {

    console.error(error);


    return Response.json(
      {
        error:
          "news_unavailable"
      },
      {
        status: 503
      }
    );

  }

}


async function loadFeed(feed) {

  const response =
    await fetch(feed.url);


  if (!response.ok) {

    return [];

  }


  const xml =
    await response.text();


  const items =
    xml.match(
      /<item>[\s\S]*?<\/item>/g
    ) || [];


  return items
    .slice(0, 8)
    .map(
      item => {

        const title =
          extractTag(
            item,
            "title"
          );


        const link =
          extractTag(
            item,
            "link"
          );


        /*
          Google News titles often end
          with " - Publisher".
        */

        const parts =
          title.split(" - ");


        let source =
          feed.source;


        let cleanTitle =
          title;


        if (parts.length > 1) {

          source =
            parts.pop();

          cleanTitle =
            parts.join(" - ");

        }


        return {

          source:
            decodeEntities(
              source
            ),

          title:
            decodeEntities(
              cleanTitle
            ),

          url:
            decodeEntities(
              link
            )

        };

      }
    );

}


function extractTag(
  xml,
  tag
) {

  const match =
    xml.match(
      new RegExp(
        `<${tag}>([\\s\\S]*?)<\\/${tag}>`
      )
    );


  if (!match) {
    return "";
  }


  return match[1]
    .replace(
      /^<!\[CDATA\[/,
      ""
    )
    .replace(
      /\]\]>$/,
      ""
    )
    .trim();

}


function decodeEntities(
  text
) {

  return text
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");

}
