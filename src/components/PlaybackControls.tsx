import React from 'react';
import { useAlgorithmStore } from '../store/useAlgorithmStore';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';

export const PlaybackControls: React.FC = () => {
  const { currentStation, setCurrentStation } = useAlgorithmStore();

  const stations = [
    'Población Inicial',
    'Selección',
    'Cruce BCRC',
    'Mutación',
    'Búsqueda Local'
  ];

  const handleNext = () => {
    if (currentStation < stations.length - 1) {
      setCurrentStation(currentStation + 1);
    }
  };

  const handlePrev = () => {
    if (currentStation > 0) {
      setCurrentStation(currentStation - 1);
    }
  };

  return (
    <div className="glass-panel" style={{
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      width: '100%'
    }}>
      {/* Back button */}
      <button
        onClick={handlePrev}
        disabled={currentStation === 0}
        className={`btn btn-secondary ${currentStation === 0 ? 'btn-disabled' : ''}`}
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <ArrowLeft size={16} /> Estación Anterior
      </button>

      {/* Info label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BookOpen size={16} style={{ color: 'var(--color-primary)' }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
          Estación {currentStation + 1} de {stations.length}:{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>{stations[currentStation]}</strong>
        </span>
      </div>

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={currentStation === stations.length - 1}
        className={`btn btn-primary ${currentStation === stations.length - 1 ? 'btn-disabled' : ''}`}
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        Siguiente Estación <ArrowRight size={16} />
      </button>
    </div>
  );
};
