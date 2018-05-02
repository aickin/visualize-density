function runTime(name, start, end) {
  console.log(`${name} ran in ${(end.getTime() - start.getTime()) / 1000} seconds`)
}

module.exports = runTime
