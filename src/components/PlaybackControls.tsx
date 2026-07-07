import React, { useEffect, useRef } from 'react';
import { useAlgorithmStore } from '../store/useAlgorithmStore';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, FastForward } from 'lucide-react';

export const PlaybackControls: React.FC = () => {
  const {
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    currentGenerationIdx,
    setCurrentGenerationIdx,
    generaciones,
    stepForward,
    stepBackward,
    resetAlgorithm
  } = useAlgorithmStore();

  const totalGenerations = generaciones.length;
  const intervalRef = useRef<number | null>(null);

  // Handle Autoplay Loop
  useEffect(() => {
    if (isPlaying && totalGenerations > 0) {
      const intervalTime = Math.max(100, 1000 / playbackSpeed);
      
      intervalRef.current = window.setInterval(() => {
        const nextIdx = currentGenerationIdx + 1;
        if (nextIdx < totalGenerations) {
          setCurrentGenerationIdx(nextIdx);
        } else {
          setIsPlaying(false); // Stop when reaching the end
        }
      }, intervalTime);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentGenerationIdx, totalGenerations, playbackSpeed, setCurrentGenerationIdx, setIsPlaying]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentGenerationIdx(parseInt(e.target.value, 10));
  };

  const hasGenerations = totalGenerations > 0;

  return (
    <div className="glass-panel" style={{
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '24px',
      height: 'var(--playback-height)',
      width: '100%'
    }}>
      {/* Reset & Quick State */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          className="btn btn-secondary btn-icon"
          onClick={resetAlgorithm}
          title="Reiniciar Simulación"
        >
          <RotateCcw size={18} />
        </button>
        <div style={{ minWidth: '100px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600 }}>
            Generación
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700 }}>
            {hasGenerations ? `${currentGenerationIdx + 1} / ${totalGenerations}` : '0 / 0'}
          </span>
        </div>
      </div>

      {/* Main Playback Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className={`btn btn-secondary btn-icon ${(!hasGenerations || currentGenerationIdx === 0) ? 'btn-disabled' : ''}`}
            onClick={stepBackward}
            disabled={!hasGenerations || currentGenerationIdx === 0}
          >
            <SkipBack size={18} />
          </button>

          <button 
            className={`btn btn-primary btn-icon`}
            style={{ width: '52px', height: '52px' }}
            onClick={() => hasGenerations && setIsPlaying(!isPlaying)}
            disabled={!hasGenerations}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: '2px' }} />}
          </button>

          <button 
            className={`btn btn-secondary btn-icon ${(!hasGenerations || currentGenerationIdx === totalGenerations - 1) ? 'btn-disabled' : ''}`}
            onClick={stepForward}
            disabled={!hasGenerations || currentGenerationIdx === totalGenerations - 1}
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Generation Scrubbing Slider */}
        {hasGenerations && (
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>Gen 1</span>
            <input 
              type="range"
              min={0}
              max={totalGenerations - 1}
              value={currentGenerationIdx}
              onChange={handleSliderChange}
              style={{
                flex: 1,
                accentColor: 'var(--color-primary)',
                height: '6px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>Gen {totalGenerations}</span>
          </div>
        )}
      </div>

      {/* Speed Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FastForward size={16} style={{ color: 'var(--color-text-muted)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Velocidad:</span>
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '2px'
        }}>
          {([0.5, 1, 2, 4] as const).map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              style={{
                background: playbackSpeed === speed ? 'var(--color-primary)' : 'transparent',
                color: playbackSpeed === speed ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
