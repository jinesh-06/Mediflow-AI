import React from 'react';
import { useApp } from '../context/AppContext';

export function MapView({ phcs = [], onSelectPhc }) {
  const { setSelectedPhcId, setActiveTab, emergencyStatus } = useApp();
  const isEmergency = emergencyStatus?.is_active;

  // District cluster anchors mapped to an India canvas (normalized coordinates)
  // States:
  // Tamil Nadu: Chennai (x: 580, y: 550), Kanchipuram (x: 550, y: 565)
  // Karnataka: Bengaluru (x: 480, y: 540), Mysuru (x: 460, y: 570)
  // Maharashtra: Pune (x: 430, y: 410), Nashik (x: 420, y: 370)
  // West Bengal: Kolkata (x: 720, y: 350), Howrah (x: 710, y: 360)

  const handlePhcClick = (phc) => {
    setSelectedPhcId(phc.id);
    if (onSelectPhc) onSelectPhc(phc);
    else setActiveTab('phc-detail');
  };

  return (
    <div style={{ position: 'relative', width: '100%', background: '#0a101d', borderRadius: '10px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '14px', left: '16px', zIndex: 10, display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Geospatial Surveillance Grid
        </span>
        <span style={{ fontSize: '10px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', padding: '2px 6px', borderRadius: '4px' }}>
          4 States · 8 Districts · 48 PHCs
        </span>
      </div>

      <svg viewBox="0 0 900 650" style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* Background Stylized Outlines of India Regions */}
        <defs>
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* State Region Blobs */}
        {/* Maharashtra */}
        <path d="M 370 320 Q 460 330 470 430 Q 420 480 380 430 Z" fill="#131e36" stroke="#2c3f66" strokeWidth="1.5" />
        <text x="400" y="350" fill="#64748b" fontSize="12" fontWeight="700">MAHARASHTRA</text>

        {/* Karnataka */}
        <path d="M 430 470 Q 520 480 500 590 Q 440 600 420 530 Z" fill="#131e36" stroke="#2c3f66" strokeWidth="1.5" />
        <text x="445" y="520" fill="#64748b" fontSize="12" fontWeight="700">KARNATAKA</text>

        {/* Tamil Nadu */}
        <path d="M 510 520 Q 610 520 590 620 Q 520 630 500 570 Z" fill="#131e36" stroke="#2c3f66" strokeWidth="1.5" />
        <text x="535" y="600" fill="#64748b" fontSize="12" fontWeight="700">TAMIL NADU</text>

        {/* West Bengal */}
        <path d="M 680 280 Q 750 300 740 400 Q 690 410 680 340 Z" fill="#131e36" stroke="#2c3f66" strokeWidth="1.5" />
        <text x="690" y="320" fill="#64748b" fontSize="12" fontWeight="700">WEST BENGAL</text>

        {/* Emergency Transfer Arc (District B to District A / PHC-021) */}
        {isEmergency && (
          <g>
            <path
              d="M 550 565 Q 565 540 580 550"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3"
              strokeDasharray="5 5"
            >
              <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
            </path>
            <circle cx="580" cy="550" r="18" fill="url(#hubGlow)">
              <animate attributeName="r" values="10;25;10" dur="2s" repeatCount="indefinite" />
            </circle>
            <text x="595" y="540" fill="#06b6d4" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">
              Transfer: 800 ORS Units In-Transit
            </text>
          </g>
        )}

        {/* PHC Points */}
        {phcs.map((p) => {
          // Approximate x, y on canvas based on district
          let cx = 500;
          let cy = 500;
          if (p.district_id === 'DIST-01') { cx = 580 + (p.id.endsWith('1') ? 0 : (parseInt(p.id.slice(-2)) % 5) * 8 - 16); cy = 550 + (parseInt(p.id.slice(-2)) % 4) * 8; }
          else if (p.district_id === 'DIST-02') { cx = 540 + (parseInt(p.id.slice(-2)) % 5) * 8; cy = 565 + (parseInt(p.id.slice(-2)) % 4) * 8; }
          else if (p.district_id === 'DIST-03') { cx = 480 + (parseInt(p.id.slice(-2)) % 5) * 8; cy = 540 + (parseInt(p.id.slice(-2)) % 4) * 8; }
          else if (p.district_id === 'DIST-04') { cx = 460 + (parseInt(p.id.slice(-2)) % 5) * 8; cy = 570 + (parseInt(p.id.slice(-2)) % 4) * 8; }
          else if (p.district_id === 'DIST-05') { cx = 430 + (parseInt(p.id.slice(-2)) % 5) * 8; cy = 410 + (parseInt(p.id.slice(-2)) % 4) * 8; }
          else if (p.district_id === 'DIST-06') { cx = 420 + (parseInt(p.id.slice(-2)) % 5) * 8; cy = 370 + (parseInt(p.id.slice(-2)) % 4) * 8; }
          else if (p.district_id === 'DIST-07') { cx = 720 + (parseInt(p.id.slice(-2)) % 5) * 8; cy = 350 + (parseInt(p.id.slice(-2)) % 4) * 8; }
          else if (p.district_id === 'DIST-08') { cx = 710 + (parseInt(p.id.slice(-2)) % 5) * 8; cy = 360 + (parseInt(p.id.slice(-2)) % 4) * 8; }

          const isTarget = p.id === 'PHC-021';
          const pinColor = isTarget && isEmergency ? '#ef4444' : (p.id.endsWith('1') ? '#10b981' : '#38bdf8');

          return (
            <g key={p.id} onClick={() => handlePhcClick(p)} style={{ cursor: 'pointer' }}>
              <circle
                cx={cx}
                cy={cy}
                r={isTarget ? 7 : 4.5}
                fill={pinColor}
                stroke="#ffffff"
                strokeWidth={isTarget ? 2 : 1}
              />
              {isTarget && (
                <text x={cx + 10} y={cy + 4} fill="#fff" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">
                  PHC-021 (Epicenter)
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div style={{ padding: '10px 16px', background: 'rgba(14, 22, 38, 0.9)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
        <div>Click any PHC marker to drill down into operational telemetry.</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Stable
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} /> Monitored
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} /> High/Critical Stress
          </span>
        </div>
      </div>
    </div>
  );
}
