import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import {getBaseColor} from './Utils';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Histogram = ({ heatMapData, highlightedValues }) => {
  const [chartData, setChartData] = useState(new Map());
  const [activeBarIndex, setActiveBarIndex] = useState(new Map());

  useEffect(() => {
    const chartDataToSet = new Map();
    heatMapData.forEach((data, dataSetName) => {
      if (data.length === 0) { return }
      // data is an array of hexagon objects
      const values = data.map(item => item.count);
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      const binCount = 10; // Number of bins (divisions)
      const binWidth = (maxValue - minValue) / binCount;

      const bins = Array(binCount).fill(0);
      const labels = Array(binCount).fill(0).map((_, i) => 
        `${(minValue + i * binWidth).toFixed(2)} - ${(minValue + (i + 1) * binWidth).toFixed(2)}`
      );

      values.forEach(value => {
        const binIndex = Math.min(Math.floor((value - minValue) / binWidth), binCount - 1);
        bins[binIndex] += 1;
      });

      chartDataToSet.set(dataSetName, {
        labels: labels,
        datasets: [{
          label: `${dataSetName} Data Distribution`,
          data: bins,
          backgroundColor: bins.map((_, i) => i === activeBarIndex.get(dataSetName) ? '#FFFF00' : getBaseColor(dataSetName)),
          borderColor: bins.map((_, i) => i === activeBarIndex.get(dataSetName) ? 'rgba(75, 192, 192, 1)' : 'rgba(153, 102, 255, 1)'),
          borderWidth: 1
        }]
      })
     });
    
     setChartData(chartDataToSet);
  }, [heatMapData, activeBarIndex]);

  // Highlight the correct bin when the hexagon is hovered
  useEffect(() => {
    if (highlightedValues !== null) {
      const activeBarIndexToSet = new Map();
      highlightedValues.info.forEach((hexagon) => {
        // array of objects traversal
        //hexagon.name is the dataset name
        const data = heatMapData.get(hexagon.name);
        const values = data.map(item => item.count);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const binWidth = (maxValue - minValue) / 10; // Ensure this matches binCount in the previous useEffect
        const binIndex = Math.min(Math.floor((hexagon.count - minValue) / binWidth), 9);
        activeBarIndexToSet.set(hexagon.name, binIndex);
      })
      setActiveBarIndex(activeBarIndexToSet);
    } else {
      setActiveBarIndex(new Map());
    }
  }, [highlightedValues, heatMapData]);

  return (
    <>
      {[...chartData.values()].map(chartData => {
        return (
          <Bar 
            key={`${chartData.datasets.label}${chartData.labels}`}
            data={chartData}
          />
        );
      }
      )}
    </>
  );
};

export default Histogram;
