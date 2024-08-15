import React, { useEffect, useState } from 'react';
import { latLngToCell } from 'h3-js';

const url = "https://raw.githubusercontent.com/cheeaun/sgtreesdata/main/data/trees.csv";


const App = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const resolution = 9; // Set a default resolution, this can be made dynamic later

  useEffect(() => {
    const res = require("./trees.json");
    setHeatmapData(res);
  });

  const aggregateData = (data, resolution) => {
    const h3Map = {};

    data.forEach(point => {
      const h3Index = latLngToCell(parseFloat(point.lat), parseFloat(point.lon), resolution);
      if (h3Map[h3Index]) {
        h3Map[h3Index]++;
      } else {
        h3Map[h3Index] = 1;
      }
    });

    return Object.keys(h3Map).map(h3Index => ({
      h3Index,
      count: h3Map[h3Index]
    }));
  };

  return (
    <div className="App">
      <h1>Singapore Tree Heatmap</h1>
      {/* <Heatmap heatmapData={heatmapData} /> */}
    </div>
  );
};

export default App;