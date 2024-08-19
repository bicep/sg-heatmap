import React, {useState, useEffect} from 'react';
import { MapContainer, TileLayer, useMapEvent, Polygon } from 'react-leaflet';
import L from "leaflet";
import { cellToBoundary } from 'h3-js';
import "leaflet/dist/leaflet.css";
import Legend from './Legend';
import { Constants } from './Constants';


const getColorForCountWithThresholdGreen = (thresholds, count) => {
  return count > thresholds[4] ? '#00441b' :    // Dark green
         count > thresholds[3]  ? '#006d2c' :   // Forest green
         count > thresholds[2]  ? '#238b45' :   // Medium green
         count > thresholds[1]  ? '#41ab5d' :   // Light green
         count > thresholds[0]   ? '#74c476' :  // Lighter green
                                   '#a1d99b';   // Pale green
};

const getColorForCountWithThresholdOrange = (thresholds, count) => {
  return count > thresholds[4] ? '#7f2704' :    // Darker orange-brown
         count > thresholds[3]  ? '#a63603' :   // Dark orange-brown
         count > thresholds[2]  ? '#d94801' :   // Bright orange
         count > thresholds[1]  ? '#f16913' :   // Lighter orange
         count > thresholds[0]   ? '#fd8d3c' :   // Light orange
                                   '#fdae6b';   // Pale orange
};

const getColorForCountWithThresholdBlue = (thresholds, count) => {
  return count > thresholds[4] ? '#08306b' :    // Dark navy blue
         count > thresholds[3]  ? '#08519c' :   // Dark blue
         count > thresholds[2]  ? '#2171b5' :   // Medium blue
         count > thresholds[1]  ? '#4292c6' :   // Light blue
         count > thresholds[0]   ? '#6baed6' :  // Lighter blue
                                   '#9ecae1';   // Pale blue
};


const ZoomEventHandlers = ({ handleZoomEnd }) => {
  useMapEvent('zoomend', handleZoomEnd);
  return null;
};


const Heatmap = ({ heatmapData, thresholds, changeResolutionWhenZoom, dataSetSelection }) => {
  const [map, setMap] = useState(null);
  const [polygons, setPolygons] = useState([]);

  // if (map!=null) {
  //   map.eachLayer(function (layer) {
  //     if (layer._path != null) {
  //       map.removeLayer(layer);
  //     }
  //   });
  // }

  useEffect(() => {
    // Clear existing polygons when heatmapData changes
    setPolygons(
      heatmapData.map(({ h3Index, count }) => {
        const boundaries = cellToBoundary(h3Index);
        const color = getColor(thresholds, count);
        return {
          h3Index,
          boundaries,
          color,
        };
      })
    );
  }, [heatmapData, thresholds]);

  let getColor;
  // check which data and set color
  switch (dataSetSelection) {
    case Constants.tree:
      getColor = getColorForCountWithThresholdGreen;
      break;
    case Constants.hdb:
      getColor = getColorForCountWithThresholdOrange
      break;
    case Constants.populationDensity:
      getColor = getColorForCountWithThresholdBlue;
    break;
    default:
      getColor = getColorForCountWithThresholdBlue;
  }

  const handleZoomEnd = (e) => {
    // console.log('Map zoom level:', e.target.getZoom());
    let resolution = e.target.getZoom()-4;
    // if (e.target.getZoom() >=15)  {
    //   resolution = 9;
    // }
    changeResolutionWhenZoom(resolution)
  };

  return (
    <MapContainer center={[1.3521, 103.8198]} zoom={12} style={{ height: "100vh" }} ref={setMap}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Legend map={map} getColor={getColor} thresholds={thresholds}/>
      <ZoomEventHandlers handleZoomEnd={handleZoomEnd} />
      {polygons.map(({ h3Index, boundaries, color }) => (
        <Polygon key={h3Index} positions={boundaries} color={color} fillOpacity={0.7} />
      ))}
    </MapContainer>
  );
};

export default Heatmap;