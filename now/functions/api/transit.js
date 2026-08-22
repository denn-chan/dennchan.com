const SUPPORTED_STATIONS = {

  patterson: {
    name: "Patterson",
    line: "Expo Line"
  },

  metrotown: {
    name: "Metrotown",
    line: "Expo Line"
  },

  "joyce-collingwood": {
    name: "Joyce–Collingwood",
    line: "Expo Line"
  }

};


export async function onRequestGet(
  context
) {

  const url =
    new URL(
      context.request.url
    );


  const stationID =
    url.searchParams.get(
      "station"
    ) ||
    "patterson";


  const station =
    SUPPORTED_STATIONS[
      stationID
    ];


  if (!station) {

    return Response.json(
      {
        error:
          "station_not_supported",

        message:
          "This station has not been mapped yet."
      },
      {
        status: 400
      }
    );

  }


  /*
    Do NOT return fake ETA data.

    TransLink GTFS-Realtime is protobuf.

    Next stage:
      1. Decode GTFS-RT
      2. Match trip_id
      3. Match Patterson stop IDs
      4. Determine platform
      5. Resolve trip headsign
      6. Sort arrival timestamps
      7. Return first 4 per platform
  */


  return Response.json(
    {

      error:
        "realtime_parser_not_configured",

      message:
        "TransLink GTFS-Realtime parser is not configured yet.",

      station: {
        id:
          stationID,

        name:
          station.name,

        line:
          station.line
      }

    },
    {
      status: 503
    }
  );

}
