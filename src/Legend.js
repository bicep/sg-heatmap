import { useEffect, useState } from "react";
import L from "leaflet";
import "./Legend.css";
import { getColorForCountWithThreshold } from './Utils';

function Legend({ map, thresholdsWithColor }) {
  const [control, setControl] = useState(L.control({ position: "bottomright" }));

  useEffect(() => {
    if (map) {
      // remove any existing legend
      control.remove();
      const legend = L.control({ position: "bottomright" });

      legend.onAdd = () => {
        const div = L.DomUtil.create("div", "info legend");

        let labels = [];
        // multiple thresholds (eg if hdb data and trees data are selected at the same time)
        thresholdsWithColor.forEach((value) => {
          labels.push(`${value.name}`)
          let from;
          let to;
          for (let j = 0; j < value.thresholds.length; j++) {
            from = value.thresholds[j];
            to = value.thresholds[j + 1];
            const fromRounded = Math.round(from * 100) / 100;
            const toRounded = Math.round(to * 100) / 100;
    
            labels.push(
              `<i style="background:
                ${getColorForCountWithThreshold(value.thresholds, from + 1, value.colorSpectrum)}"></i> 
                ${fromRounded}
                ${(toRounded ? "&ndash;" + toRounded : "+")}`
            );
          }
        });
        // for (let i = 0; i< thresholdsWithColor.length; i++) {
        //   labels.push(`${thresholdsWithColor[i].name}`)
        //   let from;
        //   let to;
        //   for (let j = 0; j < thresholdsWithColor[i].thresholds.length; j++) {
        //     from = thresholdsWithColor[i].thresholds[j];
        //     to = thresholdsWithColor[i].thresholds[j + 1];
        //     const fromRounded = Math.round(from * 100) / 100;
        //     const toRounded = Math.round(to * 100) / 100;
    
        //     labels.push(
        //       `<i style="background:
        //         ${getColorForCountWithThreshold(thresholdsWithColor[i].thresholds, from + 1, thresholdsWithColor[i].colorSpectrum)}"></i> 
        //         ${fromRounded}
        //         ${(toRounded ? "&ndash;" + toRounded : "+")}`
        //     );
        //   }
        // }
        div.innerHTML = labels.join("<br>");
        return div;
      };
  

      legend.addTo(map);
      setControl(legend);
    }
  }, [thresholdsWithColor]);
  return null;
}

export default Legend;
