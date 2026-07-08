import React from 'react';
import { BookOpen } from 'lucide-react';

interface TechnicalExplanationCardProps {
  explicacionTecnica: string;
}

export const TechnicalExplanation: React.FC<TechnicalExplanationCardProps> = ({
  explicacionTecnica
}) => {
  return (
    <div style={{
      perspective: '1000px',
      width: '100%',
    }}>
      <div style={{
        width: '100%',
        display: 'grid',
        transformStyle: 'preserve-3d',
        transition: 'transform var(--transition-slow)',
        transform: 'rotateY(180deg)',
      }}>
        {/* Back side (Technical Explanation) */}
        <div className="glass-panel" style={{
          gridArea: '1 / 1 / 2 / 2',
          width: '100%',
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px',
          background: 'rgba(20, 22, 28, 0.95)',
          borderRadius: 'var(--radius-md)',
          borderLeft: '4px solid var(--color-info)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} style={{ color: 'var(--color-info)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--color-info)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Detalle Técnico
                </span>
              </div>
            </div>
            <h3 style={{ marginBottom: '10px', fontSize: '1.15rem' }}>Explicación Algorítmica</h3>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}>
              {explicacionTecnica}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
