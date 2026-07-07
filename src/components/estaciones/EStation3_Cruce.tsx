import React from 'react';
import { useAlgorithmStore } from '../../store/useAlgorithmStore';
import { HelpCircle, ArrowRight, RotateCcw, ArrowDown } from 'lucide-react';
import { AnalogyCard } from '../AnalogyCard';

export const EStation3_Cruce: React.FC = () => {
  const {
    crossoverStep,
    crossoverP1,
    crossoverP2,
    crossoverDonatedRoute,
    crossoverTempChrom,
    crossoverChildChrom,
    crossoverLogs,
    crossoverStepNext,
    crossoverReset
  } = useAlgorithmStore();

  const getSubstepTitle = () => {
    switch (crossoverStep) {
      case 0: return 'Paso 1: Analizar los Padres';
      case 1: return 'Paso 2: Donación de Ruta de Padre 1';
      case 2: return 'Paso 3: Limpieza de Padre 2';
      case 3: return 'Paso 4: Reinserción de CLI-01';
      case 4: return 'Paso 5: Reinserción de CLI-05 e Hijo Resultante';
      default: return '';
    }
  };

  return (
    <div className="station-grid" style={{ height: '100%' }}>
      <div className="station-main glass-panel" style={{ padding: '24px', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Operación Genética
            </span>
            <h4 style={{ margin: 0 }}>Cruce por Mejor Costo (BCRC)</h4>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={crossoverReset}>
              <RotateCcw size={16} /> Reiniciar Cruce
            </button>
            <button 
              className="btn btn-primary" 
              onClick={crossoverStepNext} 
              disabled={crossoverStep >= 4}
            >
              Siguiente Sub-Paso <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--color-border)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
          {[0, 1, 2, 3, 4].map(step => (
            <div key={step} style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: crossoverStep === step 
                ? 'var(--color-primary)' 
                : crossoverStep > step 
                  ? 'var(--color-success)' 
                  : 'var(--color-text-muted)',
              borderBottom: crossoverStep === step ? '2px solid var(--color-primary)' : '2px solid transparent',
              paddingBottom: '2px',
              transition: 'all 0.3s'
            }}>
              Paso {step + 1}
            </div>
          ))}
        </div>

        <h4 style={{ color: 'var(--color-warn)', margin: '4px 0 0' }}>{getSubstepTitle()}</h4>

        {/* Interactive Crossover visualization */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center' }}>
          {/* Padre 1 Display */}
          <div className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.01)', position: 'relative' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700, position: 'absolute', top: '4px', left: '10px' }}>PADRE 1 (Donador)</span>
            <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
              {crossoverP1.cromosoma.map((gene, idx) => {
                const isSeparator = gene <= 0;
                const isDonated = !isSeparator && crossoverDonatedRoute.includes(gene) && crossoverStep >= 1;
                
                return (
                  <div key={idx} style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: isDonated 
                      ? 'var(--color-success)' 
                      : isSeparator 
                        ? 'rgba(0,0,0,0.3)' 
                        : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isDonated ? 'var(--color-success)' : 'var(--color-border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    color: isDonated ? 'var(--color-text-inverse)' : isSeparator ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                    boxShadow: isDonated ? '0 0 10px hsla(142, 71%, 45%, 0.3)' : 'none',
                    transition: 'all 0.3s'
                  }}>
                    {isSeparator ? '|' : gene}
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: '0.75rem', marginTop: '6px', color: 'var(--color-text-muted)' }}>
              Cromosoma original del Padre 1 (Fitness: {crossoverP1.fitness.toFixed(4)}).
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowDown size={18} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
          </div>

          {/* Padre 2 / Temp Child Display */}
          <div className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.01)', position: 'relative' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-warn)', fontWeight: 700, position: 'absolute', top: '4px', left: '10px' }}>
              {crossoverStep >= 2 ? 'RECEPTOR (Temporal)' : 'PADRE 2 (Receptor)'}
            </span>
            <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
              {(crossoverStep >= 2 ? crossoverTempChrom : crossoverP2.cromosoma).map((gene, idx) => {
                const isSeparator = gene <= 0;
                // Highlight inserted nodes in step 3 and 4
                const isInsertedNode1 = gene === 1 && crossoverStep >= 3;
                const isInsertedNode5 = gene === 5 && crossoverStep >= 4;
                const isInserted = isInsertedNode1 || isInsertedNode5;

                return (
                  <div key={idx} style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: isInserted 
                      ? 'var(--color-primary)' 
                      : isSeparator 
                        ? 'rgba(0,0,0,0.3)' 
                        : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isInserted ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    color: isInserted ? 'var(--color-text-primary)' : isSeparator ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                    boxShadow: isInserted ? 'var(--shadow-primary)' : 'none',
                    transition: 'all 0.3s'
                  }}>
                    {isSeparator ? '|' : gene}
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: '0.75rem', marginTop: '6px', color: 'var(--color-text-muted)' }}>
              {crossoverStep >= 2 ? 'Removiendo duplicados y preparando la inserción de menor costo.' : 'Cromosoma original del Padre 2 (Fitness: ' + crossoverP2.fitness.toFixed(4) + ').'}
            </div>
          </div>

          {crossoverStep === 4 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ArrowDown size={18} style={{ color: 'var(--color-success)', opacity: 0.8 }} />
              </div>

              {/* Final Child Display */}
              <div className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.2)', position: 'relative' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 700, position: 'absolute', top: '4px', left: '10px' }}>HIJO RESULTANTE</span>
                <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                  {crossoverChildChrom.map((gene, idx) => {
                    const isSeparator = gene <= 0;
                    const isInherited = [1, 5].includes(gene);
                    
                    return (
                      <div key={idx} style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: isInherited 
                          ? 'var(--color-success-glow)' 
                          : isSeparator 
                            ? 'rgba(0,0,0,0.3)' 
                            : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${isInherited ? 'var(--color-success)' : 'var(--color-border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        color: isInherited ? 'var(--color-success)' : isSeparator ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                        transition: 'all 0.3s'
                      }}>
                        {isSeparator ? '|' : gene}
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '6px', color: 'var(--color-success)' }}>
                  ✅ ¡Cruce BCRC completado! El hijo hereda el agrupamiento espacial exitoso [1 ➔ 5] del Padre 1.
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="station-sidebar">
        <AnalogyCard
          titulo="Estación 3 — Cruce BCRC (Crossover)"
          analogia="El Padre 1 tiene una ruta brillante para el sur de la ciudad (clientes 1 y 5). Le 'donamos' esa ruta al Padre 2. Pero el Padre 2 ya tenía asignados a esos clientes en otros camiones, así que los sacamos para evitar duplicados y los re-insertamos uno por uno en la mejor ranura que menos 'cueste' (menor aumento de distancia y capacidad)."
          explicacionTecnica="El cruce de rutas de mejor costo (Best Cost Route Crossover - BCRC) es óptimo para VRP. A diferencia del cruce por puntos estándar (que rompe las secuencias lógicas y genera soluciones inválidas con clientes duplicados u omitidos), BCRC trasplanta rutas completas coherentes y reinserta de forma inteligente basándose en el costo de delta-distancia."
          metaforaVisual="Muestra de Padre 1 y Padre 2. Al pulsar el botón, las cajas verdes se copian y viajan a la fila inferior colocándose de forma óptima."
        />

        {/* Active Crossover Logs */}
        <div className="glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HelpCircle size={18} style={{ color: 'var(--color-primary)' }} /> Logs del Crossover</h4>
          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {crossoverLogs.map((log, idx) => (
              <div key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                🟢 {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
