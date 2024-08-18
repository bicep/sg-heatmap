import React, {useState} from 'react';
import { MapContainer, TileLayer, useMapEvent, Polygon } from 'react-leaflet';
import { cellToBoundary } from 'h3-js';
import "leaflet/dist/leaflet.css";
import Legend from './Legend';


const getColorForCount = (count) => {
  return count > 500 ? '#00441b' :
         count > 300  ? '#006d2c' :
         count > 100  ? '#228B22' :
         count > 50  ? '#32CD32' :
         count > 10   ? '#7FFF00' :
                       '#ADFF2F';
};

const getColorForCountWithThreshold = (thresholds, count) => {
  return count > thresholds[4] ? '#00441b' :
         count > thresholds[3]  ? '#006d2c' :
         count > thresholds[2]  ? '#228B22' :
         count > thresholds[1]  ? '#32CD32' :
         count > thresholds[0]   ? '#7FFF00' :
                       '#ADFF2F';
};


const ZoomEventHandlers = ({ handleZoomEnd }) => {
  useMapEvent('zoomend', handleZoomEnd);
  return null;
};


const Heatmap = ({ heatmapData, thresholds, changeResolutionWhenZoom }) => {

  const [map, setMap] = useState(null);


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
      <Legend map={map} getColor={getColorForCountWithThreshold} thresholds={thresholds}/>
      <ZoomEventHandlers handleZoomEnd={handleZoomEnd} />
      {heatmapData.map(({ h3Index, count }) => {
        const boundaries = cellToBoundary(h3Index);
        const color = getColorForCountWithThreshold(thresholds, count);
        return (
          <Polygon key={h3Index} positions={boundaries} color={color} fillOpacity={0.7} />
        );
      })}
    </MapContainer>
  );
};

export default Heatmap;