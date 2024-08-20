import { latLngToCell } from 'h3-js';

export const preparePointData = (dataSetSelection, rawData, resolution, colorSpectrum, thresholdDivisions) => {
      let heatMapDataToDisplay = aggregatePointData(rawData, resolution);
      const thresholds = calculateDivisions(heatMapDataToDisplay, thresholdDivisions);
      heatMapDataToDisplay = assignColorToDataSet(heatMapDataToDisplay, thresholds, colorSpectrum);
      return {
        heatMapDataToDisplay,
        thresholdsWithColor: [{
          name: dataSetSelection,
          thresholds,
          colorSpectrum,
        }]
      }
}

export const prepareValueData = (dataSetSelection, rawData, resolution, valueColumnName, colorSpectrum, thresholdDivisions) => {
  let heatMapDataToDisplay = aggregateValueData(rawData, resolution, valueColumnName);
  const thresholds = calculateDivisions(heatMapDataToDisplay, thresholdDivisions);
  heatMapDataToDisplay = assignColorToDataSet(heatMapDataToDisplay, thresholds, colorSpectrum);
  return {
    heatMapDataToDisplay,
    thresholdsWithColor: [{
      name: dataSetSelection,
      thresholds,
      colorSpectrum,
    }]
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

export const assignColorToDataSet = (heatmapData, thresholds, colorSpectrum) => {
  return heatmapData.map(({ h3Index, count }) => ({
    h3Index,
    count,
    color: getColorForCountWithThreshold(thresholds, count, colorSpectrum)
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