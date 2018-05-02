import React from "react";
import { Dropdown } from "semantic-ui-react";

const options = [
  { text: "200 feet", value: 200 },
  { text: "400 feet", value: 400 },
  { text: "600 feet", value: 600 },
  { text: "800 feet", value: 800 },
  { text: "1000 feet", value: 1000 },
  { text: "1200 feet", value: 1200 },
  { text: "1320 feet (1/4 mile)", value: 1320 },
  { text: "1400 feet", value: 1400 },
  { text: "1600 feet", value: 1600 },
  { text: "1800 feet", value: 1800 },
  { text: "2000 feet", value: 2000 },
  { text: "2200 feet", value: 2200 },
  { text: "2400 feet", value: 2400 },
  { text: "2600 feet", value: 2600 },
  { text: "2640 feet (1/2 mile)", value: 2640 },
  { text: "2800 feet", value: 2800 },
  { text: "3000 feet", value: 3000 }
];
export default ({ value, onChange, disabled }) => (
  <Dropdown
    fluid
    selection
    options={options}
    value={value}
    onChange={(_, data) => onChange(data.value)}
    disabled={disabled}
  />
);
