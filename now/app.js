/* =========================================
   CLOCK
========================================= */

function updateClock() {

  const now = new Date();


  document
    .getElementById("clock")
    .textContent =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone:
            "America/Vancouver",

          hour:
            "2-digit",

          minute:
            "2-digit",

          hour12:
            false
        }
      )
      .format(now);


  document
    .getElementById("date")
    .textContent =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone:
            "America/Vancouver",

          weekday:
            "long",

          month:
            "long",

          day:
            "numeric"
        }
      )
      .format(now)
      .toUpperCase();

}


updateClock();

setInterval(
  updateClock,
  1000
);



/* =========================================
   WEATHER
   Direct Open-Meteo request.
   No API key.
========================================= */

async function loadWeather() {

  const endpoint =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=49.2827" +
    "&longitude=-123.1207" +
    "&current=temperature_2m,apparent_temperature,weather_code" +
    "&daily=temperature_2m_max,temperature_2m_min" +
    "&temperature_unit=celsius" +
    "&timezone=America%2FVancouver" +
    "&forecast_days=1";


  try {

    const response =
      await fetch(endpoint);


    if (!response.ok) {

      throw new Error(
        "Weather request failed"
      );

    }


    const data =
      await response.json();


    const current =
      data.current;


    const daily =
      data.daily;


    document
      .getElementById(
        "temperature"
      )
      .textContent =
        `${Math.round(
          current.temperature_2m
        )}°`;


    document
      .getElementById(
        "condition"
      )
      .textContent =
        weatherDescription(
          current.weather_code
        );


    document
      .getElementById(
        "feels"
      )
      .textContent =
        `${Math.round(
          current.apparent_temperature
        )}°`;


    document
      .getElementById(
        "high"
      )
      .textContent =
        `${Math.round(
          daily.temperature_2m_max[0]
        )}°`;


    document
      .getElementById(
        "low"
      )
      .textContent =
        `${Math.round(
          daily.temperature_2m_min[0]
        )}°`;

  }

  catch (error) {

    console.error(
      "Weather error:",
      error
    );


    document
      .getElementById(
        "condition"
      )
      .textContent =
        "—";

  }

}


function weatherDescription(code) {

  const descriptions = {

    0: "CLEAR",

    1: "MOSTLY CLEAR",
    2: "PARTLY CLOUDY",
    3: "CLOUDY",

    45: "FOG",
    48: "FOG",

    51: "LIGHT DRIZZLE",
    53: "DRIZZLE",
    55: "HEAVY DRIZZLE",

    56: "FREEZING DRIZZLE",
    57: "FREEZING DRIZZLE",

    61: "LIGHT RAIN",
    63: "RAIN",
    65: "HEAVY RAIN",

    66: "FREEZING RAIN",
    67: "FREEZING RAIN",

    71: "LIGHT SNOW",
    73: "SNOW",
    75: "HEAVY SNOW",

    77: "SNOW",

    80: "RAIN SHOWERS",
    81: "RAIN SHOWERS",
    82: "HEAVY SHOWERS",

    85: "SNOW SHOWERS",
    86: "HEAVY SNOW",

    95: "THUNDERSTORM",
    96: "THUNDERSTORM",
    99: "THUNDERSTORM"

  };


  return descriptions[code] || "—";

}


loadWeather();

setInterval(
  loadWeather,
  10 * 60 * 1000
);



/* =========================================
   TRANSIT

   Calls your server-side endpoint.
   No fake data if endpoint is unavailable.
========================================= */

async function loadTransit() {

  try {

    const response =
      await fetch(
        "/api/transit?station=patterson",
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        "Transit unavailable"
      );

    }


    const data =
      await response.json();


    const platforms =
      Array.isArray(data.platforms)
        ? data.platforms
        : [];


    const p1 =
      platforms.find(
        p => Number(p.number) === 1
      ) || platforms[0];


    const p2 =
      platforms.find(
        p => Number(p.number) === 2
      ) || platforms[1];


    renderPlatform(
      "platform-1",
      p1?.trains || []
    );


    renderPlatform(
      "platform-2",
      p2?.trains || []
    );


    if (data.updatedAt) {

      document
        .getElementById(
          "transit-updated"
        )
        .textContent =
          "LIVE";

    }

  }

  catch (error) {

    console.warn(
      "Transit:",
      error
    );

  }

}


function renderPlatform(
  id,
  trains
) {

  const element =
    document.getElementById(id);


  const rows =
    trains
      .slice(0, 4)
      .map(train => {

        const minutes =
          Number(
            train.arrivalMinutes
          );


        let eta = "—";


        if (
          Number.isFinite(minutes)
        ) {

          eta =
            minutes <= 0
              ? "NOW"
              : `${minutes} MIN`;

        }


        return `
          <div class="arrival">

            <span>
              ${escapeHTML(
                train.destination ||
                "—"
              )}
            </span>

            <span>
              ${eta}
            </span>

          </div>
        `;

      });


  while (
    rows.length < 4
  ) {

    rows.push(`
      <div class="arrival placeholder">
        <span>—</span>
        <span>—</span>
      </div>
    `);

  }


  element.innerHTML =
    rows.join("");

}


loadTransit();

setInterval(
  loadTransit,
  30 * 1000
);



/* =========================================
   NEWS

   Keeps your /api/news endpoint.
   Silent fallback.
========================================= */

async function loadNews() {

  try {

    const response =
      await fetch(
        "/api/news",
        {
          cache:
            "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        "News unavailable"
      );

    }


    const news =
      await response.json();


    if (
      !Array.isArray(news) ||
      !news.length
    ) {

      throw new Error(
        "Empty news"
      );

    }


    renderNews(news);

    renderTicker(news);

  }

  catch (error) {

    console.warn(
      "News:",
      error
    );

  }

}


function renderNews(news) {

  document
    .getElementById("news")
    .innerHTML =
      news
        .slice(0, 4)
        .map(item => `

          <div class="headline">

            <span class="headline-source">
              ${escapeHTML(
                item.source ||
                "NEWS"
              )}
            </span>

            <span class="headline-title">

              ${
                item.url

                  ? `
                    <a
                      href="${escapeHTML(item.url)}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ${escapeHTML(
                        item.title
                      )}
                    </a>
                  `

                  : escapeHTML(
                      item.title
                    )
              }

            </span>

          </div>

        `)
        .join("");

}


function renderTicker(news) {

  const sequence =
    news
      .slice(0, 12)
      .map(item => `

        <span>
          ${escapeHTML(
            item.source ||
            "NEWS"
          )}
          ·
          ${escapeHTML(
            item.title
          )}
          &nbsp;&nbsp; →
        </span>

      `)
      .join("");


  document
    .getElementById(
      "ticker"
    )
    .innerHTML =
      sequence +
      sequence;

}


loadNews();

setInterval(
  loadNews,
  15 * 60 * 1000
);



/* =========================================
   ESCAPE
========================================= */

function escapeHTML(value = "") {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}
