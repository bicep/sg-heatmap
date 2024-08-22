import { useEffect} from 'react';
import { processHeatMapData } from './Utils';
import { cellToBoundary } from 'h3-js';
import L from 'leaflet';
import "./Insights.css";

const Insights = ({ map, heatMapData, insightsActivated }) => {
  useEffect(() => {
    if (map) {
      // Clear previous popups
      map.eachLayer(layer => {
        if (layer instanceof L.Popup) {
          map.removeLayer(layer);
        }
      });

      if (!insightsActivated) {
        return;
      }

      // process the data
      const insights = processHeatMapData(heatMapData);

      // Function to add popups for the top correlations
      const addPopups = insights => {
        insights.forEach(({ name, value, h3Index, hexagon1, hexagon2 }) => {
          const boundaries = cellToBoundary(h3Index);
          const polygonBounds = L.polygon(boundaries).getBounds();
          const popupContent = `
            <h2><b>Type:</b> ${name}</h2>
            <b>${hexagon1.name}:</b> ${hexagon1.count} | ${hexagon1.normalizedCount} Normalized <br />
            <b>${hexagon2.name}:</b> ${hexagon2.count} | ${hexagon2.normalizedCount} Normalized <br />
            <b>${name}:</b> ${value.toFixed(2)}<br />
          `;
          const popup = L.popup()
          .setLatLng(polygonBounds.getCenter())
          .setContent(popupContent)
          .addTo(map);
        });
      };

      // Add popups for top combined values and differences
      addPopups(insights);

  }

  }, [map, heatMapData, insightsActivated]);

  return null;
};

export default Insights;