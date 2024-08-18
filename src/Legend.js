import { useEffect, useState } from "react";
import L from "leaflet";
import "./Legend.css";

function Legend({ map, getColor, thresholds }) {
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
  
          labels.push(
            '<i style="background:' +
              getColor(thresholds, from + 1) +
              '"></i> ' +
              from +
              (to ? "&ndash;" + to : "+")
          );
        }
  
        div.innerHTML = labels.join("<br>");
        return div;
      };
  

      legend.addTo(map);
      setControl(legend);
    }
  }, [map, thresholds]);
  return null;
}

export default Legend;
