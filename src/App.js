import React, { useEffect, useState} from 'react';
import Heatmap from './Heatmap';
import { randomSample, preparePointData, prepareValueData} from './Utils';
import { Constants } from './Constants';

const App = () => {
  const [dataSetSelection, setDataSetSelection] = useState(Constants.tree);
  const [rawTreeData, setRawTreeData] = useState([]);
  const [rawHDBData, setRawHDBData] = useState([]);
  const [rawWorldPopData, setRawWorldPopData] = useState([]);
  const [resolution, setResolution] = useState(8); // Set a default resolution, this can be made dynamic later

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
      setRawWorldPopData(worldPopData);
    };
    fetchTreeData();
    fetchHDBData();
    fetchWorldpopData();
  }, [])

  const changeResolutionWhenZoom = (newResolution) => {
    setResolution(newResolution);
  };

    // main logic: data prep based on the data that is selected
  
  let heatMapDataToDisplay;
  let thresholds;
  
  switch (dataSetSelection) {
    case Constants.tree:
      ({ heatMapDataToDisplay, thresholds } = preparePointData(
        rawTreeData,
        resolution,
        Constants.greenSpectrum,
        Constants.thresholdDivisions
      ));
      break;
    case Constants.hdb:
      ({ heatMapDataToDisplay, thresholds } = prepareValueData(
        rawHDBData,
        resolution,
        "maxFloor",
        Constants.orangeSpectrum,
        Constants.thresholdDivisions
      ));
      break;
    case Constants.populationDensity:
      ({ heatMapDataToDisplay, thresholds } = prepareValueData(
        rawWorldPopData,
        resolution,
        "populationDensity",
        Constants.blueSpectrum,
        Constants.thresholdDivisions
      ));
      break;
    case Constants.insights:
      break;
    default:
      heatMapDataToDisplay = [];
      thresholds = [];
  }

  return (
    <div>
      <div>
        <div >
          <h1>{`Singapore ${dataSetSelection} Heatmap`}</h1>
        </div>
        <div>
          <button onClick={()=>setDataSetSelection(Constants.tree)}>{Constants.tree}</button>
          <button onClick={()=>setDataSetSelection(Constants.hdb)}>{Constants.hdb}</button>
          <button onClick={()=>setDataSetSelection(Constants.populationDensity)}>{Constants.populationDensity}</button>
          <button onClick={()=>setDataSetSelection(Constants.insights)}>{Constants.insights}</button>
          </div>
        </div>

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