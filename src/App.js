import React, { useEffect, useState} from 'react';
import Heatmap from './Heatmap';
import { aggregatePointData, aggregateValueData, calculateDivisions } from './Utils';

const App = () => {
  const [dataSetSelection, setDataSetSelection] = useState("hdb");
  const [rawTreeData, setRawTreeData] = useState([]);
  const [rawHDBData, setRawHDBData] = useState([]);
  const [rawWorldPopData, setrawWorldPopData] = useState([]);
  const [resolution, setResolution] = useState(8); // Set a default resolution, this can be made dynamic later

  function randomSample(data, sampleSize) {
    const totalRows = data.length;
    const indices = Array.from({ length: sampleSize }, (_, i) => Math.floor(Math.random() * totalRows));
    return indices.map(index => data[index]);
  }

  useEffect(() => {
    // load data
    const fetchTreeData = async () => {
      const treeData = await require("./trees.json");
      const smallerTreeData = randomSample(treeData, 100000);
      setRawTreeData(smallerTreeData);
    };
    const fetchHDBData = async () => {
      const HDBData = await require("./hdb.json");
      setRawHDBData(HDBData);
    };
    const fetchWorldpopData = async () => {
      const worldPopData = await require("./worldpop.json");
      setrawWorldPopData(worldPopData);
    };
    fetchTreeData();
    fetchHDBData();
    fetchWorldpopData();
  }, [])

  const changeResolutionWhenZoom = (newResolution) => {
    setResolution(newResolution);
  };



  let heatMapDataToDisplay;
  // check if tree of hdb data
  switch (dataSetSelection) {
    case "tree":
      heatMapDataToDisplay = aggregatePointData(rawTreeData, resolution);
      break;
    case "hdb":
      heatMapDataToDisplay = aggregateValueData(rawHDBData, resolution, "maxFloor");
      break;
    case "worldpop":
      heatMapDataToDisplay = aggregateValueData(rawWorldPopData, resolution, "populationDensity");
    break;
    default:
      heatMapDataToDisplay = [];
  }

  const thresholds = calculateDivisions(heatMapDataToDisplay, 6);

  return (
    <div>
      <h1>{`Singapore ${dataSetSelection} Heatmap`}</h1>
      <Heatmap
        heatmapData={heatMapDataToDisplay}
        thresholds={thresholds}
        changeResolutionWhenZoom={changeResolutionWhenZoom}
        dataSetSelection={dataSetSelection}
       />
    </div>
  );
};

export default App;