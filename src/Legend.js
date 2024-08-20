import { useEffect, useState } from "react";
import L from "leaflet";
import "./Legend.css";
import { getColorForCountWithThreshold } from './Utils';

function Legend({ map, colorSpectrum, thresholds }) {
  const [control, setControl] = useState(L.control({ position: "bottomright" }));

  useEffect(() => {
    if (map) {
      // remove any existing legend
      control.remove();
      const legend = L.control({ position: "bottomright" });

      legend.onAdd = () => {
        const div = L.DomUtil.create("div", "info legend");
        let labels = [];
        let from;
        let to;
  
        for (let i = 0; i < thresholds.length; i++) {
          from = thresholds[i];
          to = thresholds[i + 1];
          const fromRounded = Math.round(from * 100) / 100;
          const toRounded = Math.round(to * 100) / 100;
  
          labels.push(
            '<i style="background:' +
              getColorForCountWithThreshold(thresholds, from + 1, colorSpectrum) +
              '"></i> ' +
              fromRounded +
              (toRounded ? "&ndash;" + toRounded : "+")
          );
        }
  
        div.innerHTML = labels.join("<br>");
        return div;
      };
  

      legend.addTo(map);
      setControl(legend);
    }
  }, [thresholds]);
  return null;
}

export default Legend;
