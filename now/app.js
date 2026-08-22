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
  localStorage.getItem("denn-station") ||
  DEFAULT_STATION;


/* ---------------------------------------
   CLOCK
--------------------------------------- */

function updateClock() {

  const now = new Date();

  const timeFormatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "America/Vancouver",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }
    );

  const dateFormatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "America/Vancouver",
        weekday: "long",
        day: "numeric",
        month: "long"
      }
    );

  document.getElementById("clock").textContent =
    timeFormatter.format(now);

  document.getElementById("date").textContent =
    dateFormatter
      .format(now)
      .toUpperCase();

}


updateClock();

setInterval(
  updateClock,
  1000
);


/* ---------------------------------------
   WEATHER
--------------------------------------- */

async function loadWeather() {

  try {

    const response =
      await fetch(
        "/api/weather",
        {
          cache: "no-store"
        }
      );

    if (!response.ok) {
      throw new Error("Weather request failed");
    }

    const weather =
      await response.json();


    document.getElementById(
      "temperature"
    ).textContent =
      `${Math.round(weather.temperature)}°`;


    document.getElementById(
      "weather-condition"
    ).textContent =
      weather.condition;


    document.getElementById(
      "feels-like"
    ).textContent =
      `${Math.round(weather.feelsLike)}°`;


    document.getElementById(
      "weather-high"
    ).textContent =
      `H ${Math.round(weather.high)}°`;


    document.getElementById(
      "weather-low"
    ).textContent =
      `L ${Math.round(weather.low)}°`;

  }

  catch (error) {

    console.error(error);

    document.getElementById(
      "weather-condition"
    ).textContent =
      "Weather unavailable";

  }

}


loadWeather();

setInterval(
  loadWeather,
  10 * 60 * 1000
);


/* ---------------------------------------
   TRANSIT
--------------------------------------- */

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
          cache: "no-store"
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Transit unavailable"
      );

    }


    document.getElementById(
      "station-name"
    ).textContent =
      data.station.name;


    renderPlatform(
      platform1,
      data.platforms?.[0]?.trains || []
    );


    renderPlatform(
      platform2,
      data.platforms?.[1]?.trains || []
    );


    status.textContent =
      data.updatedAt
        ? `Updated ${formatUpdateTime(data.updatedAt)}`
        : "";

  }

  catch (error) {

    console.error(error);

    const unavailable =
      `
        <div class="train-row loading-row">
          <span>Live arrivals unavailable</span>
          <span>—</span>
        </div>
      `;

    platform1.innerHTML =
      unavailable;

    platform2.innerHTML =
      unavailable;

    status.textContent =
      "Waiting for TransLink realtime connection.";

  }

}


function renderPlatform(
  element,
  trains
) {

  if (!trains.length) {

    element.innerHTML =
      `
        <div class="train-row loading-row">
          <span>No upcoming trains</span>
          <span>—</span>
        </div>
      `;

    return;

  }


  element.innerHTML =
    trains
      .slice(0, 4)
      .map(
        train => {

          const minutes =
            Number(
              train.arrivalMinutes
            );


          let timeLabel;

          if (minutes <= 0) {
            timeLabel = "NOW";
          }

          else if (minutes === 1) {
            timeLabel = "1 MIN";
          }

          else {
            timeLabel =
              `${minutes} MIN`;
          }


          return `
            <div class="train-row">

              <span class="train-destination">
                ${escapeHTML(train.destination)}
              </span>

              <span class="train-time ${minutes <= 0 ? "now" : ""}">
                ${timeLabel}
              </span>

            </div>
          `;

        }
      )
      .join("");

}


function formatUpdateTime(date) {

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "America/Vancouver",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }
  ).format(
    new Date(date)
  );

}


loadTransit();

setInterval(
  loadTransit,
  30 * 1000
);


/* ---------------------------------------
   NEWS
--------------------------------------- */

async function loadNews() {

  try {

    const response =
      await fetch(
        "/api/news"
      );


    if (!response.ok) {
      throw new Error(
        "News request failed"
      );
    }


    const news =
      await response.json();


    renderNews(news);
    renderTicker(news);

  }

  catch (error) {

    console.error(error);

    document.getElementById(
      "news-list"
    ).innerHTML =
      `
        <div class="news-row">
          <span class="news-source">
            NEWS
          </span>

          <span>
            Headlines unavailable
          </span>
        </div>
      `;

  }

}


function renderNews(news) {

  const container =
    document.getElementById(
      "news-list"
    );


  container.innerHTML =
    news
      .slice(0, 6)
      .map(
        item => `
          <div class="news-row">

            <span class="news-source">
              ${escapeHTML(item.source)}
            </span>

            <a
              href="${escapeAttribute(item.url)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${escapeHTML(item.title)}
            </a>

          </div>
        `
      )
      .join("");

}


function renderTicker(news) {

  const track =
    document.getElementById(
      "ticker-track"
    );


  const items =
    news
      .slice(0, 10)
      .map(
        item => `
          <span>
            ${escapeHTML(item.source)}
            ·
            ${escapeHTML(item.title)}
            &nbsp;&nbsp; →
          </span>
        `
      )
      .join("");


  /*
    Duplicate content so CSS animation
    can loop continuously.
  */

  track.innerHTML =
    items + items;

}


loadNews();

setInterval(
  loadNews,
  15 * 60 * 1000
);


/* ---------------------------------------
   STATION SELECTOR
--------------------------------------- */

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
              station.id === currentStation
                ? "active"
                : ""
            }"
            type="button"
            data-station="${station.id}"
          >
            ${station.name}
          </button>
        `
      )
      .join("");


  document
    .querySelectorAll(
      ".station-option"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            currentStation =
              button.dataset.station;


            localStorage.setItem(
              "denn-station",
              currentStation
            );


            const station =
              STATIONS.find(
                item =>
                  item.id ===
                  currentStation
              );


            if (station) {

              document.getElementById(
                "station-name"
              ).textContent =
                station.name;

            }


            closeStationModal();

            loadTransit();

          }
        );

      }
    );

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


document.getElementById(
  "station-button"
).addEventListener(
  "click",
  openStationModal
);


document.getElementById(
  "station-close"
).addEventListener(
  "click",
  closeStationModal
);


document.querySelector(
  ".modal-backdrop"
).addEventListener(
  "click",
  closeStationModal
);


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      modal.classList.contains("open")
    ) {

      closeStationModal();

    }

  }
);


/* ---------------------------------------
   BASIC ESCAPING
--------------------------------------- */

function escapeHTML(value = "") {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function escapeAttribute(value = "") {

  return escapeHTML(value);

}
