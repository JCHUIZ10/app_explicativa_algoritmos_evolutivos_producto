import React, { useState } from 'react';
import { HelpCircle, RefreshCw, BookOpen } from 'lucide-react';

interface AnalogyCardProps {
  titulo: string;
  analogia: string;
  explicacionTecnica: string;
  metaforaVisual?: string;
}

export const AnalogyCard: React.FC<AnalogyCardProps> = ({
  titulo,
  analogia,
  explicacionTecnica,
  metaforaVisual
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div style={{
      perspective: '1000px',
      width: '100%',
      minHeight: '200px',
      position: 'relative'
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: 'transform var(--transition-slow)',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        {/* Front side (Analogy) */}
        <div className="glass-panel" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px',
          background: 'rgba(25, 27, 35, 0.8)',
          borderRadius: 'var(--radius-md)',
          borderLeft: '4px solid var(--color-primary)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={18} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Analogía Sencilla
                </span>
              </div>
              <button 
                onClick={() => setIsFlipped(true)}
                className="btn btn-ghost"
                style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700 }}
              >
                Ver Detalle Técnico <BookOpen size={12} />
              </button>
            </div>
            <h3 style={{ marginBottom: '10px', fontSize: '1.25rem' }}>{titulo}</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--color-text-primary)', fontStyle: 'italic' }}>
              "{analogia}"
            </p>
          </div>

          {metaforaVisual && (
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-sm)',
              border: '1px dashed var(--color-border)',
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)'
            }}>
              🎨 <strong>Metáfora Visual:</strong> {metaforaVisual}
            </div>
          )}
        </div>

        {/* Back side (Technical Explanation) */}
        <div className="glass-panel" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
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
              <button 
                onClick={() => setIsFlipped(false)}
                className="btn btn-ghost"
                style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700 }}
              >
                Volver a Analogía <RefreshCw size={12} />
              </button>
            </div>
            <h3 style={{ marginBottom: '10px', fontSize: '1.25rem' }}>Explicación Algorítmica</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}>
              {explicacionTecnica}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
