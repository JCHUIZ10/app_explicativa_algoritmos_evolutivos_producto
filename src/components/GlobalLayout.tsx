import React from 'react';
import { XPProgressBar } from './XPProgressBar';
import { PlaybackControls } from './PlaybackControls';
import { Network, House , Settings } from 'lucide-react';
import { useAlgorithmStore } from '../store/useAlgorithmStore';

interface GlobalLayoutProps {
  children: React.ReactNode;
}

export const GlobalLayout: React.FC<GlobalLayoutProps> = ({ children }) => {
  const currentStation = useAlgorithmStore((state) => state.currentStation);
  const setCurrentStation = useAlgorithmStore((state) => state.setCurrentStation);

  const stations = [
    { label: 'Población', emoji: '🌱' },
    { label: 'Selección', emoji: '⚔️' },
    { label: 'Cruce', emoji: '🧬' },
    { label: 'Mutación', emoji: '✨' },
    { label: 'Búsqueda Local', emoji: '🔍' },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100vh',
      background: 'var(--color-bg)',
      overflow: 'hidden',
    }}>
      {/* ─── Header ──────────────────────────────────────── */}
      <header style={{
        flexShrink: 0,
        height: 'var(--header-height)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(16, 18, 24, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 10,
        gap: '16px',
      }}>
        {/* Brand */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => setCurrentStation(0)}
        >
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, hsl(280, 85%, 60%) 100%)',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-primary)',
          }}>
            <Network size={20} style={{ color: '#fff' }} />
          </div>
          <div>
            <h1 style={{
              fontSize: '1.1rem',
              margin: 0,
              fontWeight: 800,
              background: 'linear-gradient(90deg, #fff, #bbb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap',
            }}>
              Distribuidoras Líder AG
            </h1>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600 }}>
              Laboratorio de Computación Evolutiva
            </span>
          </div>
        </div>

        {/* Step Navigation — centred & scrollable on small screens */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          overflowX: 'auto',
          flex: 1,
          justifyContent: 'center',
        }}>
          {stations.map((s, idx) => {
            const isActive = currentStation === idx;
            return (
              <button
                key={idx}
                onClick={() => setCurrentStation(idx)}
                style={{
                  background: isActive ? 'rgba(170, 59, 255, 0.12)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                  padding: '10px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  whiteSpace: 'nowrap',
                  borderRadius: '6px 6px 0 0',
                }}
              >
                {s.emoji} {s.label}
              </button>
            );
          })}
        </nav>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button className="btn btn-ghost btn-icon" title="Ir al inicio" onClick={() => setCurrentStation(0)}>
            <House size={17} />
          </button>
        </div>
      </header>

      {/* ─── Main Content ─────────────────────────────────── */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 20px 12px',
        gap: '12px',
        overflow: 'hidden',       /* keeps the flex chain alive */
        minHeight: 0,
      }}>
        {/* XP bar — compact, always visible */}
        <div style={{ flexShrink: 0 }}>
          <XPProgressBar />
        </div>

        {/* Station view — takes remaining height */}
        <div style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {children}
        </div>
      </main>

      {/* ─── Footer / Playback ───────────────────────────── */}
      <footer style={{
        flexShrink: 0,
        padding: '10px 20px',
        background: 'rgba(16, 18, 24, 0.92)',
        borderTop: '1px solid var(--color-border)',
      }}>
        <PlaybackControls />
      </footer>
    </div>
  );
};
