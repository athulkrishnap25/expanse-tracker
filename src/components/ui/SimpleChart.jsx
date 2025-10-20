import React from 'react';

// A tiny responsive sparkline-like SVG chart for demonstration.
// Accepts `data` array of numbers, `height`, and `color` props.
const SimpleChart = ({ data = [5, 10, 8, 12, 9, 15], height = 120, color = '#06b6d4' }) => {
  if (!data || data.length === 0) return null;
  const width = 600; // viewBox width, will scale responsively
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    // normalize y (invert because SVG y grows downwards)
    const y = height - ((d - min) / (max - min || 1)) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-28 sm:h-36">
        <polyline fill="none" stroke={color} strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

export default SimpleChart;
