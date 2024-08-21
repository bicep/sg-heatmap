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
  const [dataSetSelections, setDataSetSelections] = useState([Constants.tree]);
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

  const treeCheckButtonHandler = (e) => {
    checkButtonHandler(e, Constants.tree, dataSetSelections, setDataSetSelections)
  }

  const hdbCheckButtonHandler = (e) => {
    checkButtonHandler(e, Constants.hdb, dataSetSelections, setDataSetSelections)
  }

  const pdCheckButtonHandler = (e) => {
    checkButtonHandler(e, Constants.populationDensity, dataSetSelections, setDataSetSelections)
  }

  // main logic: data prep based on the data that is selected
  let heatMapData = new Map();
  let normalizedHeatMapData = new Map();
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
        normalizedHeatMapData.set(Constants.tree, preparedTData.normalizedData);
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
        normalizedHeatMapData.set(Constants.hdb, preparedHData.normalizedData);
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
        normalizedHeatMapData.set(Constants.populationDensity, preparePDData.normalizedData);
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
              onChange={treeCheckButtonHandler}/> {Constants.tree}
          </label>
          <label>
            <input 
              type="checkbox"
              name={Constants.hdb}
              checked={dataSetSelections.includes(Constants.hdb)}
              onChange={hdbCheckButtonHandler}/> {Constants.hdb}
          </label>
          <label>
            <input 
              type="checkbox"
              name={Constants.populationDensity}
              checked={dataSetSelections.includes(Constants.populationDensity)}
              onChange={pdCheckButtonHandler}/> {Constants.populationDensity}
          </label>
          <button onClick={()=>setDataSetSelections(Constants.insights)}>{Constants.insights}</button>
          </div>
        </div>

      <Heatmap
        heatMapData={heatMapData}
        thresholdsWithColor={thresholds}
        changeResolutionWhenZoom={changeResolutionWhenZoom}
        dataSetSelections={dataSetSelections}
       />
    </div>
  );
};

export default App;