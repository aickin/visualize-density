// Flattens an object
// e.g. {"a": {"b": "foo"}} -> {"a.b": "foo"}

function flatten(obj, name, stem) {
  var out = {};
  var newStem = stem !== undefined && stem !== "" ? `${stem}.${name}` : name;
  if (typeof obj !== "object") {
    out[newStem] = obj;
    return out;
  }
  for (let p in obj) {
    out = { ...out, ...flatten(obj[p], p, newStem) };
  }
  return out;
}

module.exports = flatten;
