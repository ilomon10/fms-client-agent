import GPS from "gps";

export function GPSGetState(): GPS.GPSState {
  return {
    errors: getRandomInt(0, 1000),
    processed: getRandomInt(0, 1000),
    time: new Date(),
    lat: getRandomFloat(1, 2),
    lon: getRandomFloat(124, 125),
    alt: getRandomInt(0, 100),
    satsActive: [],
    satsVisible: [],
    speed: getRandomFloat(20, 100),
    track: getRandomFloat(0, 360),
    fix: false,
    hdop: getRandomFloat(0, 100),
    vdop: getRandomFloat(0, 100),
    pdop: getRandomFloat(0, 100),
  };
}

function getRandomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function getRandomInt(min: number, max: number) {
  min = Math.ceil(min); // Ensure min is an integer
  max = Math.floor(max); // Ensure max is an integer
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
