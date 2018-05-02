const readline = require("readline");

const LOG_INTERVAL = 1000;

class ProgressLogger {
  constructor() {
    this._init();
  }

  _init() {
    this._numGroupsAdded = 0;
    this._numGroupsFinished = 0;
    this._numItemsProcessed = 0;
  }

  reset() {
    this.finish();
    this._init();
  }

  start() {
    this._start = new Date();
    return this;
  }

  addGroups(numGroups) {
    this._numGroupsAdded += numGroups;
  }

  finishGroup() {
    this._numGroupsFinished++;
    this.logProgress();
    return this._numGroupsAdded - this._numGroupsFinished;
  }

  increment(count) {
    for (let i = 0; i < (count || 1); i++) {
      if (++this._numItemsProcessed % LOG_INTERVAL === 0) {
        this.logProgress();
      }
    }
  }

  finish() {
    this.logProgress();
    process.stdout.write("\n");
  }

  logProgress() {
    const duration = (new Date() - this._start) / 1000;
    const durationString = `${duration.toLocaleString()}s`;

    const groupCount = this._numGroupsAdded;
    const groupIndex = Math.min(this._numGroupsFinished + 1, groupCount);
    const groupsString = `${groupIndex}/${groupCount}`;
    const groupsPrefixString = groupCount ? `[${groupsString}] ` : "";

    const itemString = this._numItemsProcessed.toLocaleString();

    const ips = Math.round(this._numItemsProcessed / duration);
    const rateString = `${ips.toLocaleString()}/s`;

    const progressString = `${groupsPrefixString}${itemString} (${rateString}) ${durationString}`;

    readline.cursorTo(process.stdout, 0);
    process.stdout.write(progressString);
  }
}

module.exports = ProgressLogger;
