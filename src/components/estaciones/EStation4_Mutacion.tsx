import React from 'react';
import { useAlgorithmStore } from '../../store/useAlgorithmStore';
import { Sparkles, RotateCcw, AlertTriangle, ArrowRightLeft, Move } from 'lucide-react';
import { TechnicalExplanation } from '../TechnicalExplanationCard';

export const EStation4_Mutacion: React.FC = () => {
  const {
    mutationChrom,
    mutationOriginalChrom,
    mutationMode,
    mutationSelectedIndices,
    mutationSetMode,
    mutationClickGene,
    mutationReset,
    clientes,
    vehiculos
  } = useAlgorithmStore();

  // Helper to split route for distance calculation
  const splitRoutes = (chrom: number[]): number[][] => {
    const routes: number[][] = [];
    let currentRoute: number[] = [];
    for (const gene of chrom) {
      if (gene <= 0) {
        routes.push(currentRoute);
        currentRoute = [];
      } else {
        currentRoute.push(gene);
      }
    }
    routes.push(currentRoute);
    while (routes.length < vehiculos.length) {
      routes.push([]);
    }
    return routes.slice(0, vehiculos.length);
  };

  const getDist = (id1: string, id2: string) => {
    const c1 = clientes.find(c => c.id === id1)!;
    const c2 = clientes.find(c => c.id === id2)!;
    return Math.sqrt(Math.pow(c1.lat - c2.lat, 2) + Math.pow(c1.lng - c2.lng, 2));
  };

  // Simplified evaluator for the mutated chromosome
  const calculateDistance = (chrom: number[]) => {
    const routes = splitRoutes(chrom);
    let totalDist = 0;
    
    routes.forEach(route => {
      let lastNode = clientes[0]; // depot
      route.forEach(clientIdx => {
        const client = clientes[clientIdx];
        totalDist += getDist(lastNode.id, client.id);
        lastNode = client;
      });
      totalDist += getDist(lastNode.id, clientes[0].id);
    });
    
    return Math.round(totalDist * 10) / 10;
  };

  const originalDist = calculateDistance(mutationOriginalChrom);
  const currentDist = calculateDistance(mutationChrom);
  const diffDist = Math.round((currentDist - originalDist) * 10) / 10;

  return (
    <div className="station-grid" style={{ height: '100%' }}>
      <div className="station-main glass-panel" style={{ padding: '24px', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Operación Genética
            </span>
            <h4 style={{ margin: 0 }}>Laboratorio de Mutación Híbrida</h4>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={mutationReset}>
              <RotateCcw size={16} /> Restaurar Cromosoma
            </button>
          </div>
        </div>

        {/* Mutation Mode Selector */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => mutationSetMode('swap')}
            className={`btn ${mutationMode === 'swap' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
          >
            <ArrowRightLeft size={16} /> Mutación Swap
          </button>
          <button
            onClick={() => mutationSetMode('or-opt')}
            className={`btn ${mutationMode === 'or-opt' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
          >
            <Move size={16} /> Mutación Or-opt
          </button>
        </div>

        {/* Interaction Guidelines */}
        <div style={{
          padding: '10px 14px',
          background: 'rgba(255, 170, 0, 0.03)',
          border: '1px dashed rgba(255, 170, 0, 0.2)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          color: 'var(--color-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertTriangle size={16} style={{ color: 'var(--color-warn)' }} />
          <span>
            {mutationMode === 'swap' 
              ? 'Mecanismo: Haz clic en 2 bloques de clientes cualesquiera para intercambiar de posición.'
              : 'Mecanismo: Haz clic en cualquier cliente para extraerlo y moverlo 2 posiciones adelante (simula el cambio de bloque Or-opt).'}
          </span>
        </div>

        {/* Interactive Chromosome Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'center' }}>
          <div>
            <h5 style={{ marginBottom: '8px', color: 'var(--color-warn)' }}>Cromosoma Mutante (Interactivo)</h5>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {mutationChrom.map((gene, idx) => {
                const isSeparator = gene <= 0;
                const isSelected = mutationSelectedIndices.includes(idx);
                
                return (
                  <div
                    key={idx}
                    onClick={() => mutationClickGene(idx)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '6px',
                      background: isSelected 
                        ? 'var(--color-danger)' 
                        : isSeparator 
                          ? 'rgba(0,0,0,0.3)' 
                          : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isSelected ? 'var(--color-danger)' : 'var(--color-border)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      color: isSelected ? 'var(--color-text-primary)' : isSeparator ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                      cursor: isSeparator ? 'not-allowed' : 'pointer',
                      transform: isSelected ? 'scale(1.1)' : 'none',
                      boxShadow: isSelected ? '0 0 12px var(--color-danger-glow)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isSeparator ? '|' : gene}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reference Chromosome */}
          <div>
            <h5 style={{ marginBottom: '8px', color: 'var(--color-text-muted)' }}>Cromosoma Original (Referencia)</h5>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', opacity: 0.6 }}>
              {mutationOriginalChrom.map((gene, idx) => {
                const isSeparator = gene <= 0;
                return (
                  <div
                    key={`orig-${idx}`}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '6px',
                      background: isSeparator ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      color: isSeparator ? 'var(--color-text-muted)' : 'var(--color-text-primary)'
                    }}
                  >
                    {isSeparator ? '|' : gene}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="station-sidebar">
        <TechnicalExplanation
          explicacionTecnica="La mutación híbrida es la clave para la exploración. En Swap, se intercambian dos genes al azar, lo cual puede cambiar la asignación o el orden de visita. En Or-opt, se reubica un segmento contiguo. Esto rompe la homogeneidad de la población y ayuda a 'saltar' de óptimos locales estancados."
        />

        {/* Live Distance impact details */}
        <div className="glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={18} style={{ color: 'var(--color-primary)' }} /> Calculadora en Vivo</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Distancia Original:</span>
              <strong>{originalDist} km</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Distancia Actualizada:</span>
              <strong style={{ color: diffDist > 0 ? 'var(--color-danger)' : diffDist < 0 ? 'var(--color-success)' : 'var(--color-text-primary)' }}>
                {currentDist} km
              </strong>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              borderTop: '1px solid var(--color-border)', 
              paddingTop: '8px',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}>
              <span>Impacto de la Mutación:</span>
              <span style={{ color: diffDist > 0 ? 'var(--color-danger)' : diffDist < 0 ? 'var(--color-success)' : 'var(--color-text-primary)' }}>
                {diffDist > 0 ? `+${diffDist} km ❌` : diffDist < 0 ? `${diffDist} km 🏆` : 'Sin cambio'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
