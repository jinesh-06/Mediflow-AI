import React, { useState, useEffect } from 'react';
import { Globe2, ShieldCheck, Cpu, ArrowRight, Layers } from 'lucide-react';
import { api } from '../api/client';

export function BricsExplorer() {
  const [bricsData, setBricsData] = useState(null);

  useEffect(() => {
    loadBricsData();
  }, []);

  const loadBricsData = async () => {
    try {
      const data = await api.getBricsArchitecture();
      setBricsData(data);
    } catch (err) {
      console.error('Error loading BRICS architecture:', err);
    }
  };

  const countries = [
    { country: 'India', flag: '🇮🇳', partner: 'AIIMS & ICMR Central Health Hub', status: 'ACTIVE PILOT', role: 'Lead Sovereign Coordinator', phcs: '48 PHCs (Pilot)' },
    { country: 'Brazil', flag: '🇧🇷', partner: 'DATASUS / Fiocruz Federated Gateway', status: 'COMPATIBLE SPEC', role: 'Latin American Health Node', phcs: 'Ready for Ingestion' },
    { country: 'Russia', flag: '🇷🇺', partner: 'National Medical Research Radiological Centre', status: 'COMPATIBLE SPEC', role: 'Eurasian Supply Hub', phcs: 'Ready for Ingestion' },
    { country: 'China', flag: '🇨🇳', partner: 'National Health Commission Data Center', status: 'COMPATIBLE SPEC', role: 'East Asian Epidemiological Node', phcs: 'Ready for Ingestion' },
    { country: 'South Africa', flag: '🇿🇦', partner: 'National Health Laboratory Service (NHLS)', status: 'COMPATIBLE SPEC', role: 'African Healthcare Supply Hub', phcs: 'Ready for Ingestion' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">BRICS Cross-Border Federated Scalability Architecture</h2>
          <div className="page-desc">
            India-First, BRICS-Ready: Demonstrating how the same decentralized node abstraction scales from Primary Health Centres to sovereign multinational health alliances
          </div>
        </div>
      </div>

      {/* Cross-border Privacy Declaration */}
      <div className="card" style={{ background: 'var(--bg-secondary)', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <ShieldCheck size={24} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>
              Multinational Sovereign Data Protection Architecture
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>
              Zero cross-border transfer of raw patient records or confidential hospital inventory levels. Only mathematical model weight differentials ($w^{(t+1)} - w^{(t)}$) obfuscated with Differential Privacy (Laplace noise $\epsilon = 0.5$) are communicated across sovereign gateways.
            </div>
          </div>
        </div>
      </div>

      {/* Multi-tier Hierarchical Diagram */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Layers size={16} style={{ color: 'var(--accent-blue)' }} />
            Hierarchical 4-Tier Decentralized Topology
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', background: 'var(--bg-input)', padding: '16px', borderRadius: '8px' }}>
          <div style={{ borderLeft: '3px solid #38bdf8', paddingLeft: '10px' }}>
            <div style={{ fontSize: '10px', color: 'var(--accent-blue)', fontWeight: 700 }}>TIER 1: LOCAL</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>PHCs & CHCs</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Local consumption, beds & staff tracking. Data stays on-premise.
            </div>
          </div>

          <div style={{ borderLeft: '3px solid #06b6d4', paddingLeft: '10px' }}>
            <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 700 }}>TIER 2: REGIONAL</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>State Health Nodes</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Tamil Nadu, Karnataka, Maharashtra, West Bengal train local models.
            </div>
          </div>

          <div style={{ borderLeft: '3px solid #10b981', paddingLeft: '10px' }}>
            <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>TIER 3: NATIONAL</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>India Coordinator</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Ministry of Health aggregates state updates via FedAvg.
            </div>
          </div>

          <div style={{ borderLeft: '3px solid #6366f1', paddingLeft: '10px' }}>
            <div style={{ fontSize: '10px', color: '#6366f1', fontWeight: 700 }}>TIER 4: BRICS</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>Multinational Gateway</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Sovereign weight exchange between BRICS healthcare authorities.
            </div>
          </div>
        </div>
      </div>

      {/* BRICS Member Node Cards */}
      <div className="card-header" style={{ marginBottom: '-8px' }}>
        <div className="card-title">
          <Globe2 size={16} style={{ color: 'var(--accent-cyan)' }} />
          Federated Sovereign Node Directory
        </div>
      </div>

      <div className="grid-cols-3">
        {countries.map((c) => (
          <div key={c.country} className="card" style={{ borderTop: `3px solid ${c.country === 'India' ? '#10b981' : 'var(--border-strong)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{c.flag}</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>{c.country}</span>
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                background: c.status === 'ACTIVE PILOT' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.06)',
                color: c.status === 'ACTIVE PILOT' ? '#10b981' : 'var(--text-muted)'
              }}>
                {c.status}
              </span>
            </div>

            <div style={{ margin: '14px 0', fontSize: '12px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Designated Gateway:</div>
              <div style={{ fontWeight: 600, color: '#fff', marginTop: '2px' }}>{c.partner}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', background: 'var(--bg-secondary)', padding: '8px 10px', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Topology Role:</span>
              <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{c.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
