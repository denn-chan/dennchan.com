const DEFAULT_STATION = "patterson";


const STATIONS = [

  {
    id: "waterfront",
    name: "Waterfront"
  },

  {
    id: "burrard",
    name: "Burrard"
  },

  {
    id: "granville",
    name: "Granville"
  },

  {
    id: "stadium-chinatown",
    name: "Stadium–Chinatown"
  },

  {
    id: "main-street-science-world",
    name: "Main Street–Science World"
  },

  {
    id: "commercial-broadway",
    name: "Commercial–Broadway"
  },

  {
    id: "nanaimo",
    name: "Nanaimo"
  },

  {
    id: "29th-avenue",
    name: "29th Avenue"
  },

  {
    id: "joyce-collingwood",
    name: "Joyce–Collingwood"
  },

  {
    id: "patterson",
    name: "Patterson"
  },

  {
    id: "metrotown",
    name: "Metrotown"
  },

  {
    id: "royal-oak",
    name: "Royal Oak"
  }

];


let currentStation =
  localStorage.getItem(
    "denn-now-station"
  ) || DEFAULT_STATION;



/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

  const now =
    new Date();


  const time =
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
    );


  const date =
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
    );


  document
    .getElementById("clock")
    .textContent =
      time.format(now);


  document
    .getElementById("date")
    .textContent =
      date
        .format(now)
        .toUpperCase();

}


updateClock();


setInterval(
  updateClock,
  1000
);



/* =========================================================
   WEATHER
========================================================= */

async function loadWeather() {

  const condition =
    document.getElementById(
      "weather-condition"
    );


  try {

    const response =
      await fetch(
        "/api/weather",
        {
          cache:
            "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        `Weather API ${response.status}`
      );

    }


    const data =
      await response.json();


    document
      .getElementById(
        "temperature"
      )
      .textContent =
        `${Math.round(data.temperature)}°`;


    condition.textContent =
      data.condition ||
      "Unknown";


    document
      .getElementById(
        "feels-like"
      )
      .textContent =
        `${Math.round(data.feelsLike)}°`;


    document
      .getElementById(
        "weather-high"
      )
      .textContent =
        `H ${Math.round(data.high)}°`;


    document
      .getElementById(
        "weather-low"
      )
      .textContent =
        `L ${Math.round(data.low)}°`;

  }

  catch (error) {

    console.error(
      "Weather:",
      error
    );


    condition.textContent =
      "Unavailable";

  }

}


loadWeather();


setInterval(
  loadWeather,
  10 * 60 * 1000
);



/* =========================================================
   TRANSIT
========================================================= */

async function loadTransit() {

  const platform1 =
    document.getElementById(
      "platform-1"
    );


  const platform2 =
    document.getElementById(
      "platform-2"
    );


  const status =
    document.getElementById(
      "transit-status"
    );


  try {

    const response =
      await fetch(
        `/api/transit?station=${encodeURIComponent(currentStation)}`,
        {
          cache:
            "no-store"
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        `Transit API ${response.status}`
      );

    }


    if (data.station?.name) {

      document
        .getElementById(
          "station-name"
        )
        .textContent =
          data.station.name;

    }


    const platforms =
      Array.isArray(data.platforms)
        ? data.platforms
        : [];


    const first =
      platforms.find(
        item =>
          Number(item.number) === 1
      ) ||
      platforms[0];


    const second =
      platforms.find(
        item =>
          Number(item.number) === 2
      ) ||
      platforms[1];


    renderPlatform(
      platform1,
      first?.trains || []
    );


    renderPlatform(
      platform2,
      second?.trains || []
    );


    if (data.updatedAt) {

      status.textContent =
        `UPDATED ${formatTime(data.updatedAt)}`;

    }

    else {

      status.textContent = "";

    }

  }

  catch (error) {

    console.error(
      "Transit:",
      error
    );


    renderUnavailablePlatform(
      platform1
    );


    renderUnavailablePlatform(
      platform2
    );


    status.textContent =
      "REALTIME CONNECTION UNAVAILABLE";

  }

}


function renderPlatform(
  container,
  trains
) {

  if (
    !Array.isArray(trains) ||
    trains.length === 0
  ) {

    container.innerHTML =
      `
        <div class="train-row muted">
          <span>No upcoming trains</span>
          <span>—</span>
        </div>
      `;

    return;

  }


  container.innerHTML =
    trains
      .slice(0, 4)
      .map(
        train => {

          const minutes =
            Number(
              train.arrivalMinutes
            );


          let time;


          if (
            Number.isFinite(minutes) &&
            minutes <= 0
          ) {

            time = "NOW";

          }

          else if (
            minutes === 1
          ) {

            time = "1 MIN";

          }

          else if (
            Number.isFinite(minutes)
          ) {

            time =
              `${minutes} MIN`;

          }

          else {

            time = "—";

          }


          return `
            <div class="train-row">

              <span class="train-destination">
                ${escapeHTML(
                  train.destination ||
                  "Train"
                )}
              </span>

              <span
                class="train-time ${
                  minutes <= 0
                    ? "now"
                    : ""
                }"
              >
                ${time}
              </span>

            </div>
          `;

        }
      )
      .join("");

}


function renderUnavailablePlatform(
  container
) {

  container.innerHTML =
    `
      <div class="train-row muted">

        <span>
          Live arrivals unavailable
        </span>

        <span>
          —
        </span>

      </div>
    `;

}


function formatTime(
  value
) {

  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";

  }


  return new Intl.DateTimeFormat(
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
  ).format(date);

}


loadTransit();


setInterval(
  loadTransit,
  30 * 1000
);



/* =========================================================
   NEWS
========================================================= */

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
        `News API ${response.status}`
      );

    }


    const data =
      await response.json();


    const news =
      Array.isArray(data)
        ? data
        : [];


    if (!news.length) {

      throw new Error(
        "No headlines returned"
      );

    }


    renderNews(news);

    renderTicker(news);


    document
      .getElementById(
        "news-updated"
      )
      .textContent =
        `UPDATED ${formatTime(
          new Date()
        )}`;

  }

  catch (error) {

    console.error(
      "News:",
      error
    );


    document
      .getElementById(
        "news-list"
      )
      .innerHTML =
        `
          <div class="news-item">

            <span class="news-source">
              NEWS
            </span>

            <span class="news-title muted">
              Headlines unavailable
            </span>

          </div>
        `;


    document
      .getElementById(
        "ticker-track"
      )
      .innerHTML =
        `
          <span>
            NEWS FEED UNAVAILABLE
          </span>
        `;

  }

}


function renderNews(
  news
) {

  const container =
    document.getElementById(
      "news-list"
    );


  /*
    Landscape display only needs
    three visible headlines.
  */

  container.innerHTML =
    news
      .slice(0, 3)
      .map(
        item => {

          const title =
            escapeHTML(
              item.title || ""
            );


          const source =
            escapeHTML(
              item.source || "NEWS"
            );


          const url =
            safeURL(
              item.url
            );


          return `
            <div class="news-item">

              <span class="news-source">
                ${source}
              </span>

              <span class="news-title">

                ${
                  url
                    ? `
                      <a
                        href="${escapeHTML(url)}"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ${title}
                      </a>
                    `
                    : title
                }

              </span>

            </div>
          `;

        }
      )
      .join("");

}


function renderTicker(
  news
) {

  const track =
    document.getElementById(
      "ticker-track"
    );


  const headlines =
    news
      .slice(0, 12)
      .map(
        item => `
          <span>
            ${escapeHTML(
              item.source ||
              "NEWS"
            )}
            ·
            ${escapeHTML(
              item.title ||
              ""
            )}
            &nbsp;&nbsp; →
          </span>
        `
      )
      .join("");


  /*
    Duplicate the sequence for
    continuous scrolling.
  */

  track.innerHTML =
    headlines +
    headlines;

}


loadNews();


setInterval(
  loadNews,
  15 * 60 * 1000
);



/* =========================================================
   STATION SELECTOR
========================================================= */

const modal =
  document.getElementById(
    "station-modal"
  );


const stationList =
  document.getElementById(
    "station-list"
  );


function renderStations() {

  stationList.innerHTML =
    STATIONS
      .map(
        station => `
          <button
            class="station-option ${
              station.id ===
              currentStation
                ? "active"
                : ""
            }"
            type="button"
            data-station="${escapeHTML(
              station.id
            )}"
          >
            <span>
              ${escapeHTML(
                station.name
              )}
            </span>
          </button>
        `
      )
      .join("");


  stationList
    .querySelectorAll(
      ".station-option"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const selected =
              button.dataset.station;


            const station =
              STATIONS.find(
                item =>
                  item.id ===
                  selected
              );


            if (!station) {
              return;
            }


            currentStation =
              station.id;


            localStorage.setItem(
              "denn-now-station",
              currentStation
            );


            document
              .getElementById(
                "station-name"
              )
              .textContent =
                station.name;


            closeStationModal();


            setTransitLoading();


            loadTransit();

          }
        );

      }
    );

}


function setTransitLoading() {

  const loading =
    `
      <div class="train-row muted">

        <span>
          Loading arrivals
        </span>

        <span>
          —
        </span>

      </div>
    `;


  document
    .getElementById(
      "platform-1"
    )
    .innerHTML =
      loading;


  document
    .getElementById(
      "platform-2"
    )
    .innerHTML =
      loading;


  document
    .getElementById(
      "transit-status"
    )
    .textContent =
      "";

}


function openStationModal() {

  renderStations();


  modal.classList.add(
    "open"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeStationModal() {

  modal.classList.remove(
    "open"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );

}


document
  .getElementById(
    "station-button"
  )
  .addEventListener(
    "click",
    openStationModal
  );


document
  .getElementById(
    "station-close"
  )
  .addEventListener(
    "click",
    closeStationModal
  );


document
  .querySelector(
    ".station-backdrop"
  )
  .addEventListener(
    "click",
    closeStationModal
  );


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      modal.classList.contains(
        "open"
      )
    ) {

      closeStationModal();

    }

  }
);



/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(
  value = ""
) {

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


function safeURL(
  value
) {

  if (!value) {
    return "";
  }


  try {

    const url =
      new URL(value);


    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {

      return "";

    }


    return url.href;

  }

  catch {

    return "";

  }

}
