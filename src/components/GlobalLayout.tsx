import React from 'react';
import { XPProgressBar } from './XPProgressBar';
import { PlaybackControls } from './PlaybackControls';
import { Network, HelpCircle, Settings } from 'lucide-react';
import { useAlgorithmStore } from '../store/useAlgorithmStore';

interface GlobalLayoutProps {
  children: React.ReactNode;
}

export const GlobalLayout: React.FC<GlobalLayoutProps> = ({ children }) => {
  const currentStation = useAlgorithmStore((state) => state.currentStation);
  const setCurrentStation = useAlgorithmStore((state) => state.setCurrentStation);
  const resetAlgorithm = useAlgorithmStore((state) => state.resetAlgorithm);

  const stations = [
    'Configuración',
    'Población',
    'Evaluación',
    'Selección',
    'Cruce BCRC',
    'Mutación',
    'Búsqueda Local',
    'Convergencia'
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      background: 'var(--color-bg)'
    }}>
      {/* Header / Navbar */}
      <header style={{
        height: 'var(--header-height)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(16, 18, 24, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={resetAlgorithm}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, hsl(280, 85%, 60%) 100%)',
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-primary)'
          }}>
            <Network size={22} style={{ color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800, background: 'linear-gradient(90deg, #fff, #bbb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Distribuidoras Líder AG
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600 }}>
              Laboratorio de Computación Evolutiva
            </span>
          </div>
        </div>

        {/* Stepper Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {stations.map((name, idx) => {
            const isActive = currentStation === idx;
            return (
              <button
                key={idx}
                onClick={() => setCurrentStation(idx)}
                style={{
                  background: isActive ? 'rgba(170, 59, 255, 0.1)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                  padding: '12px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {idx}. {name}
              </button>
            );
          })}
        </nav>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-ghost btn-icon" title="Configuración de Parámetros" onClick={() => setCurrentStation(0)}>
            <Settings size={18} />
          </button>
          <button className="btn btn-ghost btn-icon" title="Ayuda y Conceptos">
            <HelpCircle size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        gap: '20px',
        overflow: 'hidden'
      }}>
        {/* Progress Bar always present */}
        <XPProgressBar />

        {/* Active view */}
        <div style={{
          flex: 1,
          width: '100%',
          overflowY: 'auto',
          position: 'relative'
        }}>
          {children}
        </div>
      </main>

      {/* Footer / Playback controls */}
      <footer style={{
        padding: '16px 24px',
        background: 'rgba(16, 18, 24, 0.9)',
        borderTop: '1px solid var(--color-border)'
      }}>
        <PlaybackControls />
      </footer>
    </div>
  );
};
