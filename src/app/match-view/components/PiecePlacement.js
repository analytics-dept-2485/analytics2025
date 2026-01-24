'use client';
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function PiecePlacement({ colors, matchMax, fuel }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Fuel'],
          datasets: [
            {
              data: [fuel],
              backgroundColor: colors[0],
              borderColor: colors[2],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: matchMax,
              title: {
                display: true,
                text: 'Average Fuel Scored'
              }
            },
          },
          plugins: {
            legend: {
              display: false // Disable the legend entirely
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Fuel: ${context.raw}`;
                }
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [fuel, matchMax, colors]);

  return <canvas ref={chartRef} />;
}