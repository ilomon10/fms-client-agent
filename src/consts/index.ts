export const internalEvents = Object.freeze({
  GEOFENCE_START: "geofence:start",
  GEOFENCE_STOP: "geofence:stop",
  GEOFENCE_UPDATE: "geofence:update",
  AUTH: "auth:token",
  AUTH_LOGOUT: "auth:logout",
  AUTH_UPDATE: "auth:update",
  GPS_DATA: "gps:data",
  EVENT_UPDATE: "event:update",
});

export const gridlockEvents = Object.freeze({
  NEXT_EVENT: "event:next",
});
