"use client";
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
// import styles from "./EPALineChart.module.css";

export default function EPALineChart({ 
  data, 
  color = "#116677", 
  width = 380, 
  height = 275 
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
  // <div className={styles.epaMargin}>
    <LineChart width={width} height={height} data={data}>
      <XAxis dataKey="name"/>
      <YAxis/>
      <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
      <Line type="monotone" dataKey="blue" stroke="#99ADEF" />
      <Line type="monotone" dataKey="red" stroke="#EDB3BA" />
      <Tooltip></Tooltip>
    </LineChart>
  // </div>
  );
}