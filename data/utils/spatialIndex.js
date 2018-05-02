const rbush = require("rbush");
const turf = require("@turf/turf");

class SpatialIndex {
  constructor(leafNodeLimit) {
    this._index = rbush(leafNodeLimit);
  }

  insert(feature) {
    const bbox = turf.bbox(feature);
    this._index.insert({
      ...this._bboxSearchFields(bbox),
      feature
    });
  }

  search(bbox) {
    const query = this._bboxSearchFields(bbox);
    return this._index.search(query).map(r => r.feature);
  }

  _bboxSearchFields(bbox) {
    return {
      minX: bbox[0],
      minY: bbox[1],
      maxX: bbox[2],
      maxY: bbox[3]
    };
  }
}

module.exports = SpatialIndex;
