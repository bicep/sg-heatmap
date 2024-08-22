import React, { useEffect, useState} from 'react';
import Heatmap from './Heatmap';
import {
  randomSample,
  preparePointData,
  prepareValueData,
  checkButtonHandler,
} from './Utils';
import { Constants } from './Constants';

const App = () => {
  const [dataSetSelections, setDataSetSelections] = useState([Constants.tree, Constants.hdb]);
  const [rawTreeData, setRawTreeData] = useState([]);
  const [rawHDBData, setRawHDBData] = useState([]);
  const [rawWorldPopData, setRawWorldPopData] = useState([]);
  const [insightsActivated, setInsightsActivated] = useState(false);
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

  const treeCheckBoxHandler = (e) => {
    checkButtonHandler(e, Constants.tree, dataSetSelections, setDataSetSelections)
  }

  const hdbCheckBoxHandler = (e) => {
    checkButtonHandler(e, Constants.hdb, dataSetSelections, setDataSetSelections)
  }

  const pdCheckBoxHandler = (e) => {
    checkButtonHandler(e, Constants.populationDensity, dataSetSelections, setDataSetSelections)
  }

  const insightsCheckBoxHandler = (e) => {
    if (e.target.checked) {
      // add tree data
      setInsightsActivated(true);
    }
    else {
      setInsightsActivated(false);
    }
  }

  // main logic: data prep based on the data that is selected
  let heatMapData = new Map();
  let thresholds = new Map();
  
  for (const dataSetSelection of dataSetSelections) {
    switch (dataSetSelection) {
      case Constants.tree:
        const preparedTData = preparePointData(
          dataSetSelection,
          rawTreeData,
          resolution,
          Constants.greenSpectrum,
          Constants.thresholdDivisions
        );
        heatMapData.set(Constants.tree, preparedTData.heatMapDataToDisplay);
        thresholds.set(Constants.tree, preparedTData.thresholdsWithColor);
        break;
      case Constants.hdb:
        const preparedHData = prepareValueData(
          dataSetSelection,
          rawHDBData,
          resolution,
          "maxFloor",
          Constants.orangeSpectrum,
          Constants.thresholdDivisions
        );
        heatMapData.set(Constants.hdb, preparedHData.heatMapDataToDisplay);
        thresholds.set(Constants.hdb, preparedHData.thresholdsWithColor);
        break;
      case Constants.populationDensity:
        const preparePDData = prepareValueData(
          dataSetSelection,
          rawWorldPopData,
          resolution,
          "populationDensity",
          Constants.blueSpectrum,
          Constants.thresholdDivisions
        );
        heatMapData.set(Constants.populationDensity, preparePDData.heatMapDataToDisplay);
        thresholds.set(Constants.populationDensity, preparePDData.thresholdsWithColor);
        break;
      default:
    }
  }

  return (
    <div>
      <div>
        <div >
          <h1>{`Singapore ${dataSetSelections.join(', ')} Heatmap`}</h1>
        </div>
        <div>
          <label>
            <input 
              type="checkbox"
              name={Constants.tree}
              checked={dataSetSelections.includes(Constants.tree)}
              onChange={treeCheckBoxHandler}/> {Constants.tree}
          </label>
          <label>
            <input 
              type="checkbox"
              name={Constants.hdb}
              checked={dataSetSelections.includes(Constants.hdb)}
              onChange={hdbCheckBoxHandler}/> {Constants.hdb}
          </label>
          <label>
            <input 
              type="checkbox"
              name={Constants.populationDensity}
              checked={dataSetSelections.includes(Constants.populationDensity)}
              onChange={pdCheckBoxHandler}/> {Constants.populationDensity}
          </label>
          <label>
            <input 
              type="checkbox"
              name={Constants.insights}
              checked={insightsActivated}
              onChange={insightsCheckBoxHandler}/> {Constants.insights}
          </label>
          </div>
        </div>

      <Heatmap
        heatMapData={heatMapData}
        thresholdsWithColor={thresholds}
        changeResolutionWhenZoom={changeResolutionWhenZoom}
        dataSetSelections={dataSetSelections}
        insightsActivated={insightsActivated}
       />
    </div>
  );
};

export default App;