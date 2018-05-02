import React from "react";
import LegislatureTable from "./LegislatureTable";
import { Tab } from "semantic-ui-react";
import senateDistricts from "@aickin/visualize-density-data/legislative/senate-districts.json";
import assemblyDistricts from "@aickin/visualize-density-data/legislative/assembly-districts.json";

export default ({ hftsAlgorithm, stops }) => {
  const panes = [
    {
      menuItem: "By Senate District",
      render: () => (
        <Tab.Pane key="senate">
          <LegislatureTable
            hftsAlgorithm={hftsAlgorithm}
            stops={stops}
            districts={senateDistricts}
            stopField="senate"
          />
        </Tab.Pane>
      )
    },
    {
      menuItem: "By Assembly District",
      render: () => (
        <Tab.Pane key="assembly">
          <LegislatureTable
            hftsAlgorithm={hftsAlgorithm}
            stops={stops}
            districts={assemblyDistricts}
            stopField="assembly"
          />
        </Tab.Pane>
      )
    }
  ];

  return <Tab panes={panes} />;
};
