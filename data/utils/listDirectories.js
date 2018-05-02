const fs = require("fs");

function listDirectories(root) {
  return fs
    .readdirSync(root)
    .map(name => ({ name, path: `${root}/${name}` }))
    .filter(dir => fs.lstatSync(dir.path).isDirectory());
}

module.exports = listDirectories;
