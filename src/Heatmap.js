import React from 'react';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import { cellToBoundary } from 'h3-js';
import "leaflet/dist/leaflet.css";


const getColorForCount = (count) => {
  return count > 500 ? '#00441b' :
         count > 300  ? '#006d2c' :
         count > 100  ? '#228B22' :
         count > 50  ? '##32CD32' :
         count > 10   ? '#7FFF00' :
                       '#ADFF2F';
};

const Heatmap = ({ heatmapData }) => {
  return (
    <MapContainer center={[1.3521, 103.8198]} zoom={12} style={{ height: "100vh" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {heatmapData.map(({ h3Index, count }) => {
        const boundaries = cellToBoundary(h3Index);
        const color = getColorForCount(count);
        return (
          <Polygon key={h3Index} positions={boundaries} color={color} fillOpacity={0.7} />
        );
      })}
    </MapContainer>
  );
};

export default Heatmap;