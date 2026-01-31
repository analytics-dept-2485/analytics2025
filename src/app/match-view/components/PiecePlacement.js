'use client';
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function PiecePlacement({ colors, matchMax, fuel, passingData }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      // If passingData is provided, use it for 3-bar chart (Passing Rel. Frequency)
      if (passingData) {
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Dump', 'Bulldozer', 'Shooter'],
            datasets: [{
              data: [passingData.dump, passingData.bulldozer, passingData.shooter],
              backgroundColor: [colors[0], colors[0], colors[0]],
              borderColor: [colors[2], colors[2], colors[2]],
              borderWidth: 2,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: matchMax,
                ticks: {
                  callback: function(value) {
                    return value + '%';
                  },
                  font: { size: 10 }
                }
              },
              x: {
                ticks: { font: { size: 10 } }
              }
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return context.parsed.y + '%';
                  }
                }
              }
            }
          }
        });
      } else {
        // Original single-bar chart for fuel
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Fuel'],
            datasets: [{
              data: [fuel],
              backgroundColor: colors[0],
              borderColor: colors[2],
              borderWidth: 1,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
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
              legend: { display: false },
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
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [fuel, matchMax, colors, passingData]);

  return <canvas ref={chartRef} />;
}