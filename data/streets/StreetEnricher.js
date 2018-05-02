const turf = require("@turf/turf");
const db = require("../utils/db");

const { STREETS_TABLE } = require("./model");
const { PARCELS_TABLE } = require("../parcels/model");

const OUTLINE_START_OFFSET_FEET = 10;

class StreetEnricher {
  constructor() {
    this.name = "street";
  }

  async init() {
    // noop
  }

  // lookup streets adjacent to a feature
  // - for each frontage of the feature...
  // - find the adjacent street
  async enrich({ feature }) {
    const searchBox = turf.bbox(turf.buffer(feature, 150, { units: "feet" }));
    const streets = await db.queryFeaturesInBBox(STREETS_TABLE, searchBox);
    let parcels = await db.queryFeaturesInBBox(PARCELS_TABLE, searchBox);
    parcels = parcels.filter(f => f.properties.id !== feature.properties.id);

    // draw a line perpendicular and "out" of the polygon
    const outLineFromPoint = (point, segmentBearing) => {
      const bearing = (segmentBearing - 90) % 360;
      const startPoint = turf.destination(point, OUTLINE_START_OFFSET_FEET, bearing, {
        units: "feet"
      });
      const outPoint = turf.destination(point, 150, bearing, {
        units: "feet"
      });
      return {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            startPoint.geometry.coordinates,
            outPoint.geometry.coordinates
          ]
        }
      };
    };

    const getNearestStreetForOutLine = outLine => {
      let closestStreetIntersection;
      streets.forEach(street => {
        const intersectPoints = turf.lineIntersect(outLine, street);
        intersectPoints.features.forEach(intersectPoint => {
          const distance = turf.distance(
            outLine.geometry.coordinates[0],
            intersectPoint,
            { units: "feet" }
          ) + OUTLINE_START_OFFSET_FEET;
          const intersection = {
            type: "street",
            intersectPoint,
            distance,
            name: street.properties["FULLNAME"]
          };
          if (
            !closestStreetIntersection ||
            distance < closestStreetIntersection.distance
          ) {
            closestStreetIntersection = intersection;
          }
        });
      });
      return closestStreetIntersection;
    };

    const getNearestParcelForOutLine = outLine => {
      let closestParcelIntersection;
      parcels.forEach(parcel => {
        const intersectPoints = turf.lineIntersect(outLine, parcel);
        intersectPoints.features.forEach(intersectPoint => {
          const distance = turf.distance(
            outLine.geometry.coordinates[0],
            intersectPoint,
            { units: "feet" }
          ) + OUTLINE_START_OFFSET_FEET;
          const intersection = {
            type: "parcel",
            intersectPoint,
            distance,
            name: parcel.properties.id
          };
          if (
            !closestParcelIntersection ||
            distance < closestParcelIntersection.distance
          ) {
            closestParcelIntersection = intersection;
          }
        });
      });
      return closestParcelIntersection;
    };

    // gather all the segments
    let segments = [];
    const coordinates = feature.geometry.coordinates;
    feature.geometry.coordinates.forEach(coordinates => {
      if (feature.geometry.type === "MultiPolygon") {
        coordinates = coordinates.reduce((c, a) => [...a, ...c], []);
      }
      coordinates.forEach((c, i) => {
        if (i == 0) {
          return;
        }

        const pc = coordinates[i - 1];
        const bearing = turf.bearing(pc, c);

        const startOutLine = outLineFromPoint(pc, bearing);
        const startStreet = getNearestStreetForOutLine(startOutLine);
        if (!startStreet) {
          return; // no street across from start point
        }

        const endOutLine = outLineFromPoint(c, bearing);
        const endStreet = getNearestStreetForOutLine(endOutLine);
        if (!endStreet) {
          return; // no street across from end point
        }

        if (startStreet.name !== endStreet.name) {
          return; // streets across don't match
        }

        const s1 = startStreet.intersectPoint.geometry.coordinates;
        const s2 = endStreet.intersectPoint.geometry.coordinates;
        const sb = turf.bearing(s1, s2);
        const offset = Math.abs(sb - bearing);
        if (offset > 10) {
          return; // street across isn't parallel to segment
        }

        segments.push({
          bearing,
          start: {
            point: pc,
            outLine: startOutLine,
            street: startStreet,
            parcel: getNearestParcelForOutLine(startOutLine)
          },
          end: {
            point: c,
            outLine: endOutLine,
            street: endStreet,
            parcel: getNearestParcelForOutLine(endOutLine)
          }
        });
      });
    });

    // for each segment...
    // what's the closest road it intersects?
    // what's the closest parcel it intersects?
    // do we have a line that crosses a road with a parcel farther away?

    let matchingStreets = [];

    segments.forEach((segment, i) => {
      // get closest parcel
      let closestParcelIntersection = segment.start.parcel;
      if (segment.end.parcel) {
        if (
          !closestParcelIntersection ||
          segment.end.parcel.distance < closestParcelIntersection.distance
        ) {
          closestParcelIntersection = segment.end.parcel;
        }
      }
      // get closest street
      let closestStreetIntersection = segment.start.street;
      if (segment.end.street) {
        if (
          !closestStreetIntersection ||
          segment.end.street.distance < closestStreetIntersection.distance
        ) {
          closestStreetIntersection = segment.end.street;
        }
      }
      if (
        closestParcelIntersection &&
        closestParcelIntersection.distance < closestStreetIntersection.distance
      ) {
        return; // another parcel is closer than the street, most likely adjacent
      }
      if (!closestParcelIntersection) {
        // HACK couldn't find a parcel across the street;
        // approximate the street width
        matchingStreets.push({
          name: closestStreetIntersection.name,
          distance: closestStreetIntersection.distance * 2,
          from: "street * 2"
        });
      } else {
        matchingStreets.push({
          name: closestStreetIntersection.name,
          distance: closestParcelIntersection.distance,
          from: "parcel"
        });
      }
    });

    let width = null;
    let name = null;
    matchingStreets.forEach(street => {
      if (!width || street.distance > width) {
        width = street.distance;
        name = street.name;
      }
    });

    return {
      width,
      name
    };
  }
}

module.exports = StreetEnricher;
