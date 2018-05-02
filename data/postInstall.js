// This script cats together some stop_times.txt files that are too large for
// git. Before this script, we told people to manually run:
//
// cat data/transit/agencies/long-beach-transit/stop_times_part_1.txt /
//   data/transit/agencies/long-beach-transit/stop_times_part_2.txt > /
//   data/transit/agencies/long-beach-transit/stop_times.txt
//
// cat data/transit/agencies/los-angeles-metro-bus/stop_times_part_1.txt /
//   data/transit/agencies/los-angeles-metro-bus/stop_times_part_2.txt > /
//   data/transit/agencies/los-angeles-metro-bus/stop_times.txt
//
// This script just automates that.
const fs = require("fs");
const path = require("path");

["long-beach-transit", "los-angeles-metro-bus"].forEach(agency => {
  fs
    .createReadStream(
      path.join(
        __dirname,
        "transit",
        "agencies",
        agency,
        "stop_times_part_1.txt"
      )
    )
    .pipe(
      fs.createWriteStream(
        path.join(__dirname, "transit", "agencies", agency, "stop_times.txt")
      )
    )
    .on("close", () => {
      fs
        .createReadStream(
          path.join(
            __dirname,
            "transit",
            "agencies",
            agency,
            "stop_times_part_2.txt"
          )
        )
        .pipe(
          fs.createWriteStream(
            path.join(
              __dirname,
              "transit",
              "agencies",
              agency,
              "stop_times.txt"
            ),
            { flags: "a" }
          )
        );
    });
});
