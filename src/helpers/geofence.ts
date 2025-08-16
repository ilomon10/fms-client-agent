import * as turf from "npm:@turf/turf";
import type { Point } from "npm:geojson";
import { LocationModel } from "../schemas/location.sequelize.ts";

type GetNearestLocationsArgs = {
  locations: LocationModel[];
  distanceThreshold?: number;
  currentLocation: Point;
};

export const getNearestLocations = ({
  locations,
  distanceThreshold = 10,
  currentLocation,
}: GetNearestLocationsArgs) => {
  return locations
    .filter((location) => {
      const locationPoint = turf.point(location.geojson.coordinates);
      const currentLocation_ = currentLocation;
      const distance = turf.distance(currentLocation_, locationPoint, {
        units: "meters",
      });
      return (
        distance <= distanceThreshold &&
        Array.isArray(location.geojson.coordinates)
      );
    })
    .map((loc) => loc.toJSON());
};
