'use client';
import { useState, useEffect } from 'react';
import { VictoryPie } from "victory";

export default function Endgame({ colors, endgameData }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  // Filter out zero values for cleaner display
  const filteredData = endgameData.filter(item => item.y > 0);

  return (
    <VictoryPie
      padding={100}
      data={filteredData}
      colorScale={colors}
      labels={({ datum }) => `${datum.x}: ${Math.round(datum.y)}%`}
      style={{
        data: {
          stroke: '#000', // Black border
          strokeWidth: 1.5, // Border width
        },
        labels: {
          fontSize: 14,
          fontWeight: 'bold'
        }
      }}
    />
  );
}