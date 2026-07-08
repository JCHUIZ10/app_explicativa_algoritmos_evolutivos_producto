import React from 'react';
import { useAlgorithmStore } from '../../store/useAlgorithmStore';
import { Swords, Trophy, Sparkles, RefreshCw } from 'lucide-react';
import { TechnicalExplanation } from '../TechnicalExplanationCard';

export const EStation2_Seleccion: React.FC = () => {
  const {
    tournamentCandidates,
    tournamentWinnerId,
    tournamentStatus,
    tournamentPrepare,
    tournamentFight
  } = useAlgorithmStore();

  return (
    <div className="station-grid" style={{ height: '100%' }}>
      <div className="station-main glass-panel" style={{ padding: '24px', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Presión de Selección
            </span>
            <h4 style={{ margin: 0 }}>Arena de Combate (Torneo k=3)</h4>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={tournamentPrepare} disabled={tournamentStatus === 'fighting'}>
              <RefreshCw size={16} /> Extraer Candidatos
            </button>
            <button 
              className="btn btn-primary" 
              onClick={tournamentFight} 
              disabled={tournamentStatus !== 'ready'}
            >
              <Swords size={16} /> Iniciar Combate
            </button>
          </div>
        </div>

        {tournamentStatus === 'idle' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '16px', color: 'var(--color-text-muted)', minHeight: '200px' }}>
            <Swords size={48} style={{ opacity: 0.3 }} />
            <p style={{ textAlign: 'center', maxWidth: '300px', fontSize: '0.9rem' }}>
              Presiona <strong>Extraer Candidatos</strong> para sacar 3 soluciones aleatorias de la población al ring.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, justifyContent: 'center' }}>
            {tournamentStatus === 'fighting' && (
              <div style={{
                textAlign: 'center',
                padding: '10px',
                background: 'rgba(255, 38, 38, 0.05)',
                border: '1px solid rgba(255, 38, 38, 0.2)',
                borderRadius: '8px',
                animation: 'pulse 1s infinite alternate',
                fontSize: '0.9rem',
                color: 'var(--color-danger)',
                fontWeight: 700
              }}>
                ⚔️ COMBATE EN CURSO... Comparando coeficientes de Aptitud ⚔️
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {tournamentCandidates.map((c) => {
                const isWinner = tournamentWinnerId === c.id;
                const isLoser = tournamentWinnerId !== null && !isWinner;
                
                return (
                  <div
                    key={c.id}
                    style={{
                      background: isWinner 
                        ? 'rgba(170, 59, 255, 0.15)' 
                        : isLoser 
                          ? 'rgba(255,255,255,0.01)' 
                          : 'rgba(255, 255, 255, 0.03)',
                      border: isWinner 
                        ? '2px solid var(--color-primary)' 
                        : '1px solid var(--color-border)',
                      opacity: isLoser ? 0.4 : 1,
                      transform: isWinner ? 'scale(1.05)' : 'none',
                      boxShadow: isWinner ? 'var(--shadow-primary)' : 'none',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      position: 'relative'
                    }}
                  >
                    {isWinner && (
                      <span className="badge badge-success" style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.65rem'
                      }}>
                        <Trophy size={10} /> GANADOR
                      </span>
                    )}

                    <div style={{ textAlign: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                        Candidato #{c.id + 1}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Costo Distancia:</span>
                        <strong>{c.distancia} km</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Exceso Carga:</span>
                        <strong style={{ color: c.exceso_capacidad > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                          {c.exceso_capacidad} m³
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Exceso Jornada:</span>
                        <strong style={{ color: c.exceso_tiempo > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                          {c.exceso_tiempo} min
                        </strong>
                      </div>
                      
                      <div style={{ 
                        marginTop: '6px', 
                        paddingTop: '6px', 
                        borderTop: '1px dashed var(--color-border)',
                        display: 'flex', 
                        justifyContent: 'space-between',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}>
                        <span>Aptitud:</span>
                        <span style={{ color: isWinner ? 'var(--color-success)' : 'var(--color-primary)' }}>
                          {c.fitness.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="station-sidebar">
        <TechnicalExplanation
          explicacionTecnica="El método de selección por torneo (k=3) elige aleatoriamente k individuos y selecciona al mejor. Esto asegura que el algoritmo prefiera reproducir buenas soluciones (presión de selección), pero da una probabilidad matemática a que soluciones no óptimas aporten genes raros a la piscina evolutiva, conservando la diversidad genética."
        />

        {tournamentWinnerId !== null && (
          <div className="glass-panel animate-fade-in" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={18} style={{ color: 'var(--color-success)' }} /> Heredando Genes</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              El Candidato #{tournamentWinnerId + 1} ha ganado el combate por tener un <strong>costo de penalización inferior</strong> y un <strong>fitness superior</strong>. Sus rutas formarán la base del siguiente operador de Cruce para concebir la descendencia.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
