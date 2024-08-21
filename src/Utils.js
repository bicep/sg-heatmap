import { latLngToCell } from 'h3-js';
import { Constants } from './Constants';

export const preparePointData = (dataSetSelection, rawData, resolution, colorSpectrum, thresholdDivisions) => {
      let heatMapDataToDisplay = aggregatePointData(rawData, resolution);
      const thresholds = calculateDivisions(heatMapDataToDisplay, thresholdDivisions);
      const normalizedData = normalizeData(heatMapDataToDisplay);
      heatMapDataToDisplay = addNormalizationAndColorToDataSet(heatMapDataToDisplay, normalizedData, thresholds, colorSpectrum, dataSetSelection);
      return {
        heatMapDataToDisplay,
        thresholdsWithColor: {
          name: dataSetSelection,
          thresholds,
          colorSpectrum,
        }
      }
}

export const prepareValueData = (dataSetSelection, rawData, resolution, valueColumnName, colorSpectrum, thresholdDivisions) => {
  let heatMapDataToDisplay = aggregateValueData(rawData, resolution, valueColumnName);
  const thresholds = calculateDivisions(heatMapDataToDisplay, thresholdDivisions);
  const normalizedData = normalizeData(heatMapDataToDisplay);
  heatMapDataToDisplay = addNormalizationAndColorToDataSet(heatMapDataToDisplay, normalizedData, thresholds, colorSpectrum, dataSetSelection);
  return {
    heatMapDataToDisplay,
    normalizedData,
    thresholdsWithColor: {
      name: dataSetSelection,
      thresholds,
      colorSpectrum,
    }
  }
}

export const aggregatePointData = (data, resolution) => {
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
     count: Math.round(h3Map[h3Index]  * 100) / 100
   }));
 };

 export const aggregateValueData = (data, resolution, valueFieldName) => {
   const h3Map = {};

   data.forEach(point => {
      let h3Index;
      try {
         // lat lon problems
         h3Index = latLngToCell(parseFloat(point.lat), parseFloat(point.lon), resolution);
      } catch (e) {
         // undefined values- ignore
         // console.log(`${point.lat} and lon ${point.lon}`);
         return
      }

      // if it is zero value just ignore
      if (parseFloat(point[valueFieldName]) === 0) {
        return;
      }
      // console.log(point[valueFieldName]);
      if (h3Map[h3Index]) {
         h3Map[h3Index] = h3Map[h3Index] + parseFloat(point[valueFieldName]);
      } else {
         h3Map[h3Index] = parseInt(point[valueFieldName]);
      }
   });

   return Object.keys(h3Map).map(h3Index => ({
     h3Index,
     count: Math.round(h3Map[h3Index]  * 100) / 100
   }));
 };

 export const checkButtonHandler = (e, dataSetString, dataSetSelections, setDataSetSelections) => {
  if (e.target.checked) {
    // add tree data
    setDataSetSelections(dataSetSelections.concat(dataSetString));
  }
  else {
    // remove tree data
    let updatedDataSetSelections = []
    for (const ds of dataSetSelections) {
      if (ds !== dataSetString) {
        updatedDataSetSelections.push(ds);
      }
    }
    setDataSetSelections(updatedDataSetSelections);
  }
 }

//  export const calculateDivisions = (dataObject, divisions=5) => {
//   // Extract the values from the object
//   const values = dataObject.map(data=>data.count)

//   // Sort the values in ascending order
//   values.sort((a, b) => a - b);

//   // Calculate the thresholds for each division
//   const thresholds = [];
//   thresholds.push(0);
//   for (let i = 1; i < (divisions-1); i++) {
//     const index = Math.floor((i / divisions) * values.length);
//     thresholds.push(values[index]);
//   }

//   return thresholds;
// };

export const calculateDivisions = (dataObject, divisions = 5) => {
  // Extract the values from the object
  const values = dataObject.map(data => data.count);

  // Calculate the mean and standard deviation
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);

  // Calculate thresholds based on the normal distribution
  const thresholds = [];

  // You can adjust the z-values for more or fewer divisions
  const zValues = [-2, -1, 0, 1, 2]; // For 5 divisions, corresponding to standard deviations
  for (let i = 0; i < divisions - 1; i++) {
    const realValue = (mean + zValues[i] * stdDev);
    thresholds.push((realValue>0)?realValue:0);
  }

  return thresholds;
};

// color, name and normalization to dataset
export const addNormalizationAndColorToDataSet = (heatmapData, normalizeData, thresholds, colorSpectrum, dataSetSelection) => {
  return heatmapData.map(({ h3Index, count }, index) => ({
    h3Index,
    count,
    normalizedCount: Math.round(normalizeData[index].normalizedCount * 100) / 100,
    color: getColorForCountWithThreshold(thresholds, count, colorSpectrum),
    name: dataSetSelection,
  }));
};

export const getColorForCountWithThreshold = (thresholds, count, colorSpectrum) => {
  return count > thresholds[4] ? colorSpectrum[5] :  
         count > thresholds[3]  ? colorSpectrum[4] :   
         count > thresholds[2]  ? colorSpectrum[3] :   
         count > thresholds[1]  ? colorSpectrum[2] :   
         count > thresholds[0]   ? colorSpectrum[1] :  
                                   colorSpectrum[0];   
};

export const randomSample = (data, sampleSize) => {
  const totalRows = data.length;
  const indices = Array.from({ length: sampleSize }, (_, i) => Math.floor(Math.random() * totalRows));
  return indices.map(index => data[index]);
}

// for insights component

export const normalizeData = (heatMapDataSet) => {
  const counts = heatMapDataSet.map(data=>data.count);
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  return heatMapDataSet.map(({ h3Index, count }) => {
    const normalizedCount = (count - min) / (max - min);
    return {
      normalizedCount,
      h3Index,
    }
  });
};

export const processHeatMapData = (heatMapData) => {
  if (heatMapData.size < 2 || heatMapData.size >2 || heatMapData.values().next().value.length === 0) {
    return []
  }

  // if (heatMapData.length === 1) {
  //   let highest= 0;
  //   let highestHex= "";
  //   let lowest= Infinity;
  //   let lowestHex= "";
  
  //   heatMapData.forEach(data => {
  //     if (data.count > highest) {
  //       highest = data.count;
  //       highestHex = data.h3Index;
  //     }
  //     if (data.count < lowest) {
  //       lowest = data.count;
  //       lowestHex = data.h3Index;
  //     }
  //   });
  //   return [
  //     {
  //       name: "Highest Normalized Value",
  //       value: highest,
  //       h3Index: highestHex,
  //       dataSet1: heatMapDataDictionary.get(highestHex)[0],
  //       dataSet2: heatMapDataDictionary.get(highestHex)[1],
  //     },
  //     {
  //       name: "Lowest Normalized Value",
  //       value: lowest,
  //       h3Index: lowestHex,
  //       dataSet1: heatMapDataDictionary.get(lowestHex)[0],
  //       dataSet2: heatMapDataDictionary.get(lowestHex)[1],
  //     },
  //   ]
  // }

  // 2 or more datasets
  // return a dictionary with h3Index as key and array as values to find overlap
  const heatMapDataDictionary = new Map();
  
  // dictionary traversal
  heatMapData.forEach((value) => {
    // dictionary traversal
    value.forEach((data)=>{
      if (heatMapDataDictionary.has(data.h3Index)) {
        heatMapDataDictionary.set(data.h3Index, heatMapDataDictionary.get(data.h3Index).concat(data));
      } else {
        heatMapDataDictionary.set(data.h3Index, [data]);
      }
    });
  });

  let highest= 0;
  let highestHex= "";
  let lowest= Infinity;
  let lowestHex= "";
  let difference = 0;
  let differenceHex= "";
  heatMapDataDictionary.forEach((value, key) => {
    // there is overlap between 2 datasets
    if (value.length > 1) {
      // keeping it to 2 datasets for now, if >3 datasets it will just take the first two
      const insightSum = value[0].normalizedCount + value[1].normalizedCount;
      const insightDifference = Math.abs(value[0].normalizedCount - value[1].normalizedCount);
      if (insightSum > highest) {
        highest = insightSum;
        highestHex = key;
      }
      if (insightSum < lowest) {
        lowest = insightSum;
        lowestHex = key;
      }
      if (insightDifference > difference) {
        difference = insightDifference;
        differenceHex = key;
      }
    }
  })
  return [
    {
      name: "Highest Normalized Sum",
      value: highest,
      h3Index: highestHex,
      hexagon1: heatMapDataDictionary.get(highestHex)[0],
      hexagon2: heatMapDataDictionary.get(highestHex)[1],
    },
    {
      name: "Lowest Normalized Sum",
      value: lowest,
      h3Index: lowestHex,
      hexagon1: heatMapDataDictionary.get(lowestHex)[0],
      hexagon2: heatMapDataDictionary.get(lowestHex)[1],
    },
    {
      name: "Highest Normalized Difference",
      value: difference,
      h3Index: differenceHex,
      hexagon1: heatMapDataDictionary.get(differenceHex)[0],
      hexagon2: heatMapDataDictionary.get(differenceHex)[1],
    },
  ]
}