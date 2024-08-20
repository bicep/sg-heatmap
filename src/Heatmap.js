import React, {useState} from 'react';
import { MapContainer, TileLayer, useMapEvent, Polygon } from 'react-leaflet';
import { cellToBoundary } from 'h3-js';
import "leaflet/dist/leaflet.css";
import "./Heatmap.css";
import Legend from './Legend';
import { Constants } from './Constants';


const ZoomEventHandlers = ({ handleZoomEnd }) => {
  useMapEvent('zoomend', handleZoomEnd);
  return null;
};


const Heatmap = ({ heatmapData, thresholds, changeResolutionWhenZoom, dataSetSelection }) => {
  const [map, setMap] = useState(null);

  let colorSpectrum;
  // check which data and set color
  switch (dataSetSelection) {
    case Constants.tree:
      colorSpectrum = Constants.greenSpectrum;
      break;
    case Constants.hdb:
      colorSpectrum = Constants.orangeSpectrum
      break;
    case Constants.populationDensity:
      colorSpectrum = Constants.blueSpectrum;
    break;
    default:
      colorSpectrum = Constants.blueSpectrum;
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
      <Legend map={map} colorSpectrum={colorSpectrum} thresholds={thresholds}/>
      <ZoomEventHandlers handleZoomEnd={handleZoomEnd} />
      {heatmapData.map(({ h3Index, count, color }) => {
        const boundaries = cellToBoundary(h3Index);
        return (
          <Polygon 
          key={h3Index}
          positions={boundaries}
          pathOptions={{  
            color: color,
            fillOpacity: 0.7,
            className: "h3Polygon"
          }} />
        );
      })}
    </MapContainer>
  );
};

export default Heatmap;