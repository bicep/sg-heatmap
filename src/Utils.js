import { latLngToCell } from 'h3-js';

export const preparePointData = (dataSetSelection, rawData, resolution, colorSpectrum, thresholdDivisions) => {
      let heatMapDataToDisplay = aggregatePointData(rawData, resolution);
      const thresholds = calculateDivisions(heatMapDataToDisplay, thresholdDivisions);
      heatMapDataToDisplay = assignColorAndNameToDataSet(heatMapDataToDisplay, thresholds, colorSpectrum, dataSetSelection);
      const normalizedData = normalizeData(heatMapDataToDisplay);
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

export const prepareValueData = (dataSetSelection, rawData, resolution, valueColumnName, colorSpectrum, thresholdDivisions) => {
  let heatMapDataToDisplay = aggregateValueData(rawData, resolution, valueColumnName);
  const thresholds = calculateDivisions(heatMapDataToDisplay, thresholdDivisions);
  heatMapDataToDisplay = assignColorAndNameToDataSet(heatMapDataToDisplay, thresholds, colorSpectrum, dataSetSelection);
  const normalizedData = normalizeData(heatMapDataToDisplay);
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
     count: h3Map[h3Index]
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
     count: h3Map[h3Index]
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

 export const calculateDivisions = (dataObject, divisions=5) => {
  // Extract the values from the object
  const values = dataObject.map(data=>data.count)

  // Sort the values in ascending order
  values.sort((a, b) => a - b);

  // Calculate the thresholds for each division
  const thresholds = [];
  thresholds.push(0);
  for (let i = 1; i < (divisions-1); i++) {
    const index = Math.floor((i / divisions) * values.length);
    thresholds.push(values[index]);
  }

  return thresholds;
};

export const assignColorAndNameToDataSet = (heatmapData, thresholds, colorSpectrum, dataSetSelection) => {
  return heatmapData.map(({ h3Index, count }) => ({
    h3Index,
    count,
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
  return heatMapDataSet.map(({ h3Index, color, count, name }) => {
    const normalizedValue = (count - min) / (max - min);
    return {
      normalizedValue,
      name,
      h3Index,
      color
    }
  });
};

// const processHeatMapData = (heatMapData) => {

//   // for dataset separate and normalize the data


//   // return a dictionary with h3Index as key and array as values to find overlap
//   const heatMapDataDictionary = new Map()
  
//   heatMapData.forEach(data => {
//     if (heatMapDataDictionary[data.h3Index]) {
//       heatMapDataDictionary[data.h3Index] = heatMapDataDictionary[data.h3Index].concat(data);
//     } else {
//       heatMapDataDictionary[data.h3Index] = [data];
//     }
//   });

//   heatMapDataDictionary.forEach((value, key, map) => {
//     // there is overlap
//     if (value.len > 1) {
//       const insights = value.map((hexagon) => {
//         normalizeData(dataSet1.map(d => d.count))[index];
//       })
//     }
//   })

//   return dataSet1.map(({ h3Index, count: count1 }, index) => {
//     const count2 = dataSet2[index].count;
    
//     const normalizedCount1 = normalizeData(dataSet1.map(d => d.count))[index];
//     const normalizedCount2 = normalizeData(dataSet2.map(d => d.count))[index];
    
//     const combinedValue = normalizedCount1 + normalizedCount2;
//     const difference = Math.abs(normalizedCount1 - normalizedCount2);

//     return {
//       h3Index,
//       count1,
//       count2,
//       combinedValue,
//       difference,
//       name1: dataSet1[index].name,
//       name2: dataSet2[index].name,
//     };
//   });
// };