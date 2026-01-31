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

  // Check if there's any actual data
  const hasData = endgameData.some(item => item.y > 0);
  
  // If no data, show a message or empty state
  if (!hasData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '300px',
        color: '#999',
        fontFamily: 'Teko',
        fontSize: '20px'
      }}>
        No Data Available
      </div>
    );
  }

  return (
    <VictoryPie
      padding={100}
      data={endgameData.filter(item => item.y > 0)}
      colorScale={colors}
      labels={({ datum }) => `${datum.x}: ${Math.round(datum.y)}%`}
      style={{
        data: {
          stroke: '#fff',
          strokeWidth: 2,
        },
        labels: {
          fontSize: 14,
          fontWeight: 'bold'
        }
      }}
    />
  );
}