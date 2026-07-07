import React from 'react';
import { useAlgorithmStore } from '../store/useAlgorithmStore';
import { Award, CheckCircle } from 'lucide-react';

export const XPProgressBar: React.FC = () => {
  const currentStation = useAlgorithmStore((state) => state.currentStation);
  const generaciones = useAlgorithmStore((state) => state.generaciones);
  
  const stationsCount = 8; // 0 to 7
  const progressPercentage = (currentStation / (stationsCount - 1)) * 100;
  
  // Custom gamified XP calculation
  const totalXP = currentStation * 100 + (generaciones.length > 0 ? 150 : 0);

  return (
    <div className="glass-panel" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Award style={{ color: 'var(--color-primary)' }} size={24} />
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
            Nivel de Aprendizaje
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {totalXP} <span style={{ color: 'var(--color-primary)', fontSize: '0.85rem' }}>XP</span>
          </span>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        {/* Track */}
        <div style={{
          height: '16px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          position: 'relative'
        }}>
          {/* Fill */}
          <div style={{
            width: `${progressPercentage}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--color-primary) 0%, hsl(280, 85%, 60%) 100%)',
            borderRadius: 'var(--radius-full)',
            transition: 'width var(--transition-normal)',
            boxShadow: '0 0 12px rgba(170, 59, 255, 0.4)'
          }} />
        </div>

        {/* Station Markers */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          position: 'absolute',
          top: '-4px',
          left: '0',
          right: '0',
          padding: '0 4px',
          pointerEvents: 'none'
        }}>
          {Array.from({ length: stationsCount }).map((_, idx) => {
            const isCompleted = idx < currentStation;
            const isActive = idx === currentStation;
            
            return (
              <div 
                key={idx} 
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: 'var(--radius-full)',
                  background: isCompleted 
                    ? 'var(--color-success)' 
                    : isActive 
                      ? 'var(--color-primary)' 
                      : 'var(--color-surface)',
                  border: `2px solid ${isCompleted ? 'var(--color-success)' : isActive ? 'var(--color-text-primary)' : 'var(--color-border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive ? 'var(--shadow-primary)' : 'none',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {isCompleted ? (
                  <CheckCircle size={14} style={{ color: 'var(--color-text-inverse)' }} />
                ) : (
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                    {idx}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
