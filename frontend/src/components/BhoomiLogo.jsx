import React from 'react';

export default function BhoomiLogo({ size = 28, color = "var(--brand-blue)" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* Parcels (Polygons) */}
      <path 
        d="M16 2 L26 7 L26 15 L16 20 L6 15 L6 7 Z" 
        fill={color} 
        fillOpacity="0.15" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinejoin="round" 
      />
      <path 
        d="M26 17 L31 20 L22 25 L16 22" 
        fill="none" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinejoin="round" 
      />
      <path 
        d="M6 17 L1 20 L10 25 L16 22" 
        fill="none" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinejoin="round" 
      />
      <path 
        d="M16 22 L16 30 L22 25" 
        fill="none" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinejoin="round" 
      />
      
      {/* Network / Bridge connection passing through */}
      <path 
        d="M4 11 L16 11 L28 11" 
        stroke="var(--gis-teal)" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeDasharray="4 2" 
      />
      <circle cx="16" cy="11" r="3" fill="var(--gis-teal)" />
      <circle cx="4" cy="11" r="2" fill="var(--gis-teal)" />
      <circle cx="28" cy="11" r="2" fill="var(--gis-teal)" />
    </svg>
  );
}
