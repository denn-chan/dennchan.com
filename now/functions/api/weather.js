const VANCOUVER = {
  latitude: 49.2827,
  longitude: -123.1207
};


export async function onRequestGet() {

  const params =
    new URLSearchParams({
      latitude:
        VANCOUVER.latitude,

      longitude:
        VANCOUVER.longitude,

      current:
        [
          "temperature_2m",
          "apparent_temperature",
          "weather_code"
        ].join(","),

      daily:
        [
          "temperature_2m_max",
          "temperature_2m_min"
        ].join(","),

      temperature_unit:
        "celsius",

      timezone:
        "America/Vancouver",

      forecast_days:
        "1"
    });


  try {

    const response =
      await fetch(
        `https://api.open-meteo.com/v1/forecast?${params}`
      );


    if (!response.ok) {

      throw new Error(
        "Open-Meteo request failed"
      );

    }


    const data =
      await response.json();


    const result = {

      temperature:
        data.current
          .temperature_2m,

      feelsLike:
        data.current
          .apparent_temperature,

      condition:
        weatherCodeToText(
          data.current
            .weather_code
        ),

      high:
        data.daily
          .temperature_2m_max[0],

      low:
        data.daily
          .temperature_2m_min[0],

      updatedAt:
        data.current.time

    };


    return Response.json(
      result,
      {
        headers: {
          "Cache-Control":
            "public, max-age=300"
        }
      }
    );

  }

  catch (error) {

    console.error(error);


    return Response.json(
      {
        error:
          "weather_unavailable"
      },
      {
        status: 503
      }
    );

  }

}


function weatherCodeToText(code) {

  const conditions = {

    0: "Clear",

    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Cloudy",

    45: "Foggy",
    48: "Foggy",

    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",

    56: "Freezing drizzle",
    57: "Freezing drizzle",

    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",

    66: "Freezing rain",
    67: "Freezing rain",

    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",

    77: "Snow",

    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy showers",

    85: "Snow showers",
    86: "Heavy snow showers",

    95: "Thunderstorm",
    96: "Thunderstorm",
    99: "Thunderstorm"

  };


  return conditions[code] ||
    "Unknown";

}
