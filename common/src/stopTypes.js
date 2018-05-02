//

const STOP_CLASS_MTS = 1;
const STOP_CLASS_HFS = 2;

const STOP_TYPE_MTS_FERRY = 0;
const STOP_TYPE_MTS_RAIL = 1;
const STOP_TYPE_HIGH_FREQUENCY_BUS = 3;

const STOP_TYPE_HIGH_FREQUENCY_BUS_6X_7AM_6PM = 4;
const STOP_TYPE_HIGH_FREQUENCY_BUS_6X_7AM_8PM = 5;
const STOP_TYPE_HIGH_FREQUENCY_BUS_6X_7AM_10PM = 6;
const STOP_TYPE_HIGH_FREQUENCY_BUS_5X_7AM_6PM = 7;
const STOP_TYPE_HIGH_FREQUENCY_BUS_5X_7AM_8PM = 8;
const STOP_TYPE_HIGH_FREQUENCY_BUS_5X_7AM_10PM = 9;
const STOP_TYPE_HIGH_FREQUENCY_BUS_4X_7AM_6PM = 10;
const STOP_TYPE_HIGH_FREQUENCY_BUS_4X_7AM_8PM = 11;
const STOP_TYPE_HIGH_FREQUENCY_BUS_4X_7AM_10PM = 12;
const STOP_TYPE_HIGH_FREQUENCY_BUS_3X_7AM_6PM = 13;
const STOP_TYPE_HIGH_FREQUENCY_BUS_3X_7AM_8PM = 14;
const STOP_TYPE_HIGH_FREQUENCY_BUS_3X_7AM_10PM = 15;

const STOP_TYPE_HIGH_FREQUENCY_BUS_6X_6AM_6PM = 16;
const STOP_TYPE_HIGH_FREQUENCY_BUS_6X_6AM_8PM = 17;
const STOP_TYPE_HIGH_FREQUENCY_BUS_6X_6AM_10PM = 18;
const STOP_TYPE_HIGH_FREQUENCY_BUS_5X_6AM_6PM = 19;
const STOP_TYPE_HIGH_FREQUENCY_BUS_5X_6AM_8PM = 20;
const STOP_TYPE_HIGH_FREQUENCY_BUS_5X_6AM_10PM = 21;
const STOP_TYPE_HIGH_FREQUENCY_BUS_4X_6AM_6PM = 22;
const STOP_TYPE_HIGH_FREQUENCY_BUS_4X_6AM_8PM = 23;
const STOP_TYPE_HIGH_FREQUENCY_BUS_4X_6AM_10PM = 24;
const STOP_TYPE_HIGH_FREQUENCY_BUS_3X_6AM_6PM = 25;
const STOP_TYPE_HIGH_FREQUENCY_BUS_3X_6AM_8PM = 26;
const STOP_TYPE_HIGH_FREQUENCY_BUS_3X_6AM_10PM = 27;

// types needed for amendments 2018-04-09.
// My understanding of the amendments is that to qualify a segment requires any one of the following four time frames,
// plus the weekend time frames, plus 3X_6AM_10PM
const STOP_TYPE_HIGH_FREQUENCY_BUS_4X_6AM_9AM = 28;
const STOP_TYPE_HIGH_FREQUENCY_BUS_4X_7AM_10AM = 29;
const STOP_TYPE_HIGH_FREQUENCY_BUS_4X_3PM_6PM = 30;
const STOP_TYPE_HIGH_FREQUENCY_BUS_4X_4PM_7PM = 31;

// big numbers for weekends to allow additional weekday segments to be specified without discontinuous numbers
// although if we are going to do that, we should probably just change this to record number of trips per hour
// for each hour.
const STOP_TYPE_HIGH_FREQUENCY_BUS_SATURDAY_2X_8AM_10PM = 100;
const STOP_TYPE_HIGH_FREQUENCY_BUS_SUNDAY_2X_8AM_10PM = 101;

// function used to filter stops to high-frequency stops that should appear on the public map
// This function can be updated based on the current text of SB827.
// Currently it represents the 2018-04-09 amendments
function isHighFrequencyStopUnderCurrentSB827Text ({ types }) {
  // previous definition, from when things were simple
  return types.includes(STOP_TYPE_HIGH_FREQUENCY_BUS)

  // return types.includes(STOP_TYPE_HIGH_FREQUENCY_BUS_3X_6AM_10PM) && // all day service
  //   types.includes(STOP_TYPE_HIGH_FREQUENCY_BUS_SATURDAY_2X_8AM_10PM) && // on weekends also
  //   types.includes(STOP_TYPE_HIGH_FREQUENCY_BUS_SUNDAY_2X_8AM_10PM) && // Sundays may have less service than saturdays, include them too
  //   (
  //     // weekday peak. It is my understanding that any of these qualify as a three hour peak window.
  //     // Furthermore I *think* the current bill text *suggests* this could be *any* three hour window within the 8 hour
  //     // peak, as in 6:28 to 9:27 would qualify as well, but this is quantized to hours.
  //     // There's also a question of whether 15 minute service means four times an hour in each hour, or 12 times in 3 hours
  //     (
  //       types.includes(STOP_TYPE_HIGH_FREQUENCY_BUS_4X_6AM_9AM) ||
  //       types.includes(STOP_TYPE_HIGH_FREQUENCY_BUS_4X_7AM_10AM)
  //     ) &&
  //     (
  //       types.includes(STOP_TYPE_HIGH_FREQUENCY_BUS_4X_3PM_6PM) ||
  //       types.includes(STOP_TYPE_HIGH_FREQUENCY_BUS_4X_4PM_7PM)
  //     )
  //   );
}

// I guess this is a summary of the types above?
function stopClassForStopTypes (types) {
  if ([STOP_TYPE_MTS_FERRY, STOP_TYPE_MTS_RAIL].some(typ => types.includes(typ)))
      return STOP_CLASS_MTS;
  else if (isHighFrequencyStopUnderCurrentSB827Text({types}))
      return STOP_CLASS_HFS;
  else return 0;
}

module.exports = {
  STOP_CLASS_MTS,
  STOP_CLASS_HFS,

  STOP_TYPE_MTS_FERRY,
  STOP_TYPE_MTS_RAIL,
  STOP_TYPE_HIGH_FREQUENCY_BUS,
  STOP_TYPE_HIGH_FREQUENCY_BUS_6X_7AM_6PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_6X_7AM_8PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_6X_7AM_10PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_5X_7AM_6PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_5X_7AM_8PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_5X_7AM_10PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_4X_7AM_6PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_4X_7AM_8PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_4X_7AM_10PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_3X_7AM_6PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_3X_7AM_8PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_3X_7AM_10PM,

  STOP_TYPE_HIGH_FREQUENCY_BUS_6X_6AM_6PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_6X_6AM_8PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_6X_6AM_10PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_5X_6AM_6PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_5X_6AM_8PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_5X_6AM_10PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_4X_6AM_6PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_4X_6AM_8PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_4X_6AM_10PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_3X_6AM_6PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_3X_6AM_8PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_3X_6AM_10PM,

  STOP_TYPE_HIGH_FREQUENCY_BUS_4X_6AM_9AM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_4X_7AM_10AM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_4X_3PM_6PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_4X_4PM_7PM,

  STOP_TYPE_HIGH_FREQUENCY_BUS_SATURDAY_2X_8AM_10PM,
  STOP_TYPE_HIGH_FREQUENCY_BUS_SUNDAY_2X_8AM_10PM,


  isHighFrequencyStopUnderCurrentSB827Text,
  stopClassForStopTypes
};
