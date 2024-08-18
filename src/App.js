import React, { useEffect, useState} from 'react';
import { latLngToCell } from 'h3-js';
import Heatmap from './Heatmap';

const url = "https://raw.githubusercontent.com/cheeaun/sgtreesdata/main/data/trees.csv";


const App = () => {
  const [rawTreeData, setRawTreeData] = useState([])
  const [resolution, setResolution] = useState(8); // Set a default resolution, this can be made dynamic later

  function randomSample(data, sampleSize) {
    const totalRows = data.length;
    const indices = Array.from({ length: sampleSize }, (_, i) => Math.floor(Math.random() * totalRows));
    return indices.map(index => data[index]);
  }

  useEffect(() => {
    const fetchData = async () => {
      const data = await require('./trees.json');
      const smallerData = randomSample(data, 100000)
      setRawTreeData(smallerData);
    };
    fetchData();
  }, []);

  const changeResolutionWhenZoom = (newResolution) => {
    setResolution(newResolution);
  };

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

  const newHeatMapTreeData = aggregateData(rawTreeData, resolution);

  return (
    <div>
      <h1>Singapore Tree Heatmap</h1>
      <Heatmap heatmapData={newHeatMapTreeData} changeResolutionWhenZoom={changeResolutionWhenZoom} />
    </div>
  );
};

export default App;