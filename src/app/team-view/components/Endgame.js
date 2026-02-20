
'use client';
import { useState, useEffect } from 'react';
import { VictoryPie } from "victory";

export default function Endgame({ data, color }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  if (!isClient) {
    return null;
  }
  return (
    <VictoryPie
      padding={80}
      data={data}
      colorScale={color}
      labels={({ datum }) => `${datum.x}: ${Math.round(datum.y)}%`}
    />
  );
}