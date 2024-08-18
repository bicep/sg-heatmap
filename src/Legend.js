import { useEffect } from "react";
import L from "leaflet";
import "./Legend.css";

function Legend({ map, getColor }) {
  useEffect(() => {
    if (map) {
      const legend = L.control({ position: "bottomright" });

      legend.onAdd = () => {
        const div = L.DomUtil.create("div", "info legend");
        const grades = [0, 10, 50, 100, 300, 500];
        let labels = [];
        let from;
        let to;
  
        for (let i = 0; i < grades.length; i++) {
          from = grades[i];
          to = grades[i + 1];
  
          labels.push(
            '<i style="background:' +
              getColor(from + 1) +
              '"></i> ' +
              from +
              (to ? "&ndash;" + to : "+")
          );
        }
  
        div.innerHTML = labels.join("<br>");
        return div;
      };
  

      legend.addTo(map);
    }
  }, [map, getColor]);
  return null;
}

export default Legend;
