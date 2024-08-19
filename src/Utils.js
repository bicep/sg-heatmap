import { latLngToCell } from 'h3-js';

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
         // undefined
         console.log(`${point.lat} and lon ${point.lon}`);
         return
      }
      // console.log(point[valueFieldName]);
      if (h3Map[h3Index]) {
         h3Map[h3Index] = h3Map[h3Index] + parseInt(point[valueFieldName]);
      } else {
         h3Map[h3Index] = parseInt(point[valueFieldName]);
      }
   });

   return Object.keys(h3Map).map(h3Index => ({
     h3Index,
     count: h3Map[h3Index]
   }));
 };

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