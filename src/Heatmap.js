import React, {useState} from 'react';
import { MapContainer, TileLayer, useMapEvent, Polygon, Popup } from 'react-leaflet';
import { cellToBoundary } from 'h3-js';
import "leaflet/dist/leaflet.css";
import "./Heatmap.css";
import Legend from './Legend';
import Insights from './Insights';
import L from 'leaflet';

const ZoomEventHandlers = ({ handleZoomEnd }) => {
  useMapEvent('zoomend', handleZoomEnd);
  return null;
};


const Heatmap = ({ heatMapData, thresholdsWithColor, changeResolutionWhenZoom }) => {
  const [map, setMap] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);

  const handleZoomEnd = (e) => {
    // console.log('Map zoom level:', e.target.getZoom());
    let resolution = e.target.getZoom()-4;
    // if (e.target.getZoom() >=15)  {
    //   resolution = 9;
    // }
    changeResolutionWhenZoom(resolution)
  };

  const handleMouseOver = (e, h3Index, count, name) => {
    const layer = e.target;
    layer.setStyle({
      fillOpacity: 1,
    });

    const center = layer.getBounds().getCenter();

    // Find all polygons that intersect with the current polygon
    const intersectingPolygons = heatMapData.filter(({ h3Index }) => {
      const boundaries = cellToBoundary(h3Index);
      const polygonBounds = L.polygon(boundaries).getBounds();
      return polygonBounds.contains(center);
    });

    const aggregatedInfo = intersectingPolygons.map(({ h3Index, count, name }) => ({
      h3Index,
      count,
      name
    }));

    setPopupInfo({
      position: center,
      info: aggregatedInfo,
    });
  }

  const handleMouseOut = (e) => {
    const layer = e.target;
    layer.setStyle({
      fillOpacity: 0.7,
    });

    setPopupInfo(null);
  };

  return (
    <MapContainer center={[1.3521, 103.8198]} zoom={12} style={{ height: "100vh" }} ref={setMap}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Legend map={map} thresholdsWithColor={thresholdsWithColor}/>
      <ZoomEventHandlers handleZoomEnd={handleZoomEnd} />
      {heatMapData.map(({ h3Index, count, color, name }) => {
        const boundaries = cellToBoundary(h3Index);
        return (
          <Polygon 
          key={h3Index.concat(color)}
          positions={boundaries}
          pathOptions={{  
            color: color,
            fillOpacity: 0.7,
          }}
          className="h3Polygon"
          eventHandlers={{
            mouseover: (e) => handleMouseOver(e, h3Index, count, name),
            mouseout: handleMouseOut,
          }}
          />
        );
      })}
      {popupInfo && (
      <Popup position={popupInfo.position} autoPan={false}>
          <div>
            <strong>Hexagon Information:</strong>
            <ul>
              {popupInfo.info.map(({ h3Index, count, name }) => (
                <li key={h3Index.concat(name)}>
                  <strong>Dataset:</strong> {name} <br />
                  <strong>H3 Index:</strong> {h3Index} <br />
                  <strong>Count:</strong> {count} <br /><br />
                </li>
              ))}
            </ul>
          </div>
      </Popup>
      )}
      {/* <Insights map={map} /> */}
    </MapContainer>
  );
};

export default Heatmap;