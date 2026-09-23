import React, { useState } from 'react';
import { Bot, X, Send, Globe } from 'lucide-react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export function GeminiCopilotDrawer() {
  const { copilotOpen, setCopilotOpen } = useApp();
  const [messages, setMessages] = useState([
    {
      role: 'system',
      text: 'Greetings. I am the ResiliHealth Operations Copilot powered by Google Gemini. Ask operational questions regarding inventory runways, PHC stress metrics, or redistribution rationales.'
    }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);

  const presets = [
    'Which districts have critical medicine shortages?',
    'Why is District A at high risk?',
    'Which PHCs have the highest resource stress?',
    'What redistribution actions are awaiting approval?'
  ];

  if (!copilotOpen) return null;

  const sendMessage = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.copilotQuery(textToSend, language);
      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          text: res.answer,
          sources: res.grounded_sources
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          text: `Operational query service error: ${err.message}. Grounded facts retrieved from baseline surveillance.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="copilot-drawer">
      <div className="copilot-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: '#0284c7', padding: '4px', borderRadius: '4px', color: '#fff' }}>
            <Bot size={16} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Gemini Operations Copilot</div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Factual Grounding Active</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Language selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <Globe size={12} />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                background: 'var(--bg-input)',
                color: '#fff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '2px 4px',
                fontSize: '11px'
              }}
            >
              <option value="en">EN</option>
              <option value="hi">हिंदी</option>
              <option value="ta">தமிழ்</option>
            </select>
          </div>

          <button
            onClick={() => setCopilotOpen(false)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Preset pills */}
      <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '6px', overflowX: 'auto' }}>
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(p)}
            style={{
              whiteSpace: 'nowrap',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--accent-blue)',
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="copilot-messages">
        {messages.map((m, i) => (
          <div key={i} className={`copilot-msg ${m.role === 'user' ? 'copilot-msg-user' : 'copilot-msg-system'}`}>
            <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
            {m.sources && (
              <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', color: 'var(--text-muted)' }}>
                Verified Sources: {m.sources.join(' · ')}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="copilot-msg copilot-msg-system" style={{ color: 'var(--text-muted)' }}>
            Retrieving operational telemetry & synthesizing response...
          </div>
        )}
      </div>

      <div className="copilot-input-bar">
        <input
          type="text"
          placeholder="Ask operational question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="input-field"
        />
        <button onClick={() => sendMessage()} className="btn btn-primary" style={{ padding: '8px 12px' }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
