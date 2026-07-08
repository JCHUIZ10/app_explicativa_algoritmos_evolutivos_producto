import React from 'react';
import { useAlgorithmStore } from '../../store/useAlgorithmStore';
import { RotateCcw, Zap, Compass, CheckCircle } from 'lucide-react';
import { TechnicalExplanation } from '../TechnicalExplanationCard';

// ─── coordinate mapping — same grid as EStation1 ─────────────────────────────
const VB_W = 500;
const VB_H = 400;
const MARGIN = 60;

function mapCoords(lat: number, lng: number) {
  const latMin = -40, latMax = 35;
  const lngMin = -40, lngMax = 55;
  const x = MARGIN + ((lat - latMin) / (latMax - latMin)) * (VB_W - 2 * MARGIN);
  const y = (VB_H - MARGIN) - ((lng - lngMin) / (lngMax - lngMin)) * (VB_H - 2 * MARGIN);
  return { x, y };
}

// ─── component ───────────────────────────────────────────────────────────────
export const EStation5_LocalSearch: React.FC = () => {
  const {
    twoOptRoute,
    twoOptHasCrossing,
    twoOptApply,
    twoOptReset,
    clientes,
  } = useAlgorithmStore();

  const crossedDist   = 182.4;
  const optimizedDist = 145.2;
  const saving        = Math.round((crossedDist - optimizedDist) * 10) / 10;

  // The subset of clients used in the 2-opt demo
  const demoNodes = ['DEP', 'CLI-01', 'CLI-02', 'CLI-05', 'CLI-08'];

  return (
    <div className="station-grid" style={{ height: '100%' }}>

      {/* ═══ LEFT: Main panel ═══════════════════════════════════════════════ */}
      <div className="station-main glass-panel" style={{ overflow: 'hidden', padding: 0 }}>

        {/* ── Header row ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Optimización Local
            </span>
            <h4 style={{ margin: '2px 0 0' }}>Desanudar Rutas con 2-opt</h4>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={twoOptReset}>
              <RotateCcw size={14} /> Reiniciar
            </button>
            <button
              className={`btn ${twoOptHasCrossing ? 'btn-primary pulse-glow' : 'btn-secondary'}`}
              onClick={twoOptApply}
              disabled={!twoOptHasCrossing}
              style={{
                background: twoOptHasCrossing ? 'var(--color-success)' : undefined,
                color: '#fff',
              }}
            >
              <Zap size={14} />
              {twoOptHasCrossing ? 'Desanudar Cruce' : '¡Ruta Desanudada!'}
            </button>
          </div>
        </div>

        {/* ── Body: map + metrics ── */}
        <div style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 200px',
          gap: '12px',
          padding: '14px',
        }}>

          {/* MAP */}
          <div className="map-container">
            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet">
              {/* grid */}
              <line x1={VB_W/2} y1="0" x2={VB_W/2} y2={VB_H} stroke="rgba(255,255,255,0.03)" strokeDasharray="4" />
              <line x1="0" y1={VB_H/2} x2={VB_W} y2={VB_H/2} stroke="rgba(255,255,255,0.03)" strokeDasharray="4" />

              {/* route edges */}
              {twoOptRoute.map((nodeId, idx) => {
                if (idx === twoOptRoute.length - 1) return null;
                const nextId = twoOptRoute[idx + 1];
                const c1 = clientes.find(c => c.id === nodeId);
                const c2 = clientes.find(c => c.id === nextId);
                if (!c1 || !c2) return null;
                const p1 = mapCoords(c1.lat, c1.lng);
                const p2 = mapCoords(c2.lat, c2.lng);

                const isCrossing = twoOptHasCrossing &&
                  ((nodeId === 'CLI-01' && nextId === 'CLI-05') ||
                   (nodeId === 'CLI-02' && nextId === 'CLI-08'));

                return (
                  <line
                    key={idx}
                    x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                    stroke={isCrossing ? 'var(--color-danger)' : twoOptHasCrossing ? 'var(--color-primary)' : 'var(--color-success)'}
                    strokeWidth={isCrossing ? 3.5 : 2.5}
                    strokeDasharray={isCrossing ? '6 3' : '0'}
                    style={{ transition: 'all 0.5s ease' }}
                  />
                );
              })}

              {/* Crossing alert pulse */}
              {twoOptHasCrossing && (() => {
                // midpoint of the two crossing segments for visual marker
                const c1 = clientes.find(c => c.id === 'CLI-01');
                const c5 = clientes.find(c => c.id === 'CLI-05');
                if (!c1 || !c5) return null;
                const p1 = mapCoords(c1.lat, c1.lng);
                const p5 = mapCoords(c5.lat, c5.lng);
                const mx = (p1.x + p5.x) / 2;
                const my = (p1.y + p5.y) / 2;
                return (
                  <g onClick={twoOptApply} style={{ cursor: 'pointer' }}>
                    <circle cx={mx} cy={my} r={22}
                      fill="rgba(239,68,68,0.15)" stroke="var(--color-danger)" strokeWidth="1.5"
                      className="pulse-glow" style={{ animationDuration: '1.2s' }} />
                    <circle cx={mx} cy={my} r={7} fill="var(--color-danger)" />
                    <text x={mx} y={my - 28} textAnchor="middle" className="node-label"
                      fill="var(--color-danger)" fontSize="10">⚠ CRUCE</text>
                  </g>
                );
              })()}

              {/* nodes */}
              {clientes
                .filter(c => demoNodes.includes(c.id))
                .map(c => {
                  const pt = mapCoords(c.lat, c.lng);
                  const isDepot = c.id === 'DEP';
                  const r = isDepot ? 14 : 9;
                  return (
                    <g key={c.id}>
                      <circle
                        cx={pt.x} cy={pt.y} r={r}
                        fill={isDepot ? 'var(--color-primary)' : twoOptHasCrossing ? 'hsl(258,70%,60%)' : 'var(--color-success)'}
                        stroke={isDepot ? '#fff' : 'rgba(255,255,255,0.5)'}
                        strokeWidth={isDepot ? 2 : 1}
                        className="map-node"
                        style={{ transition: 'fill 0.5s ease' }}
                      />
                      <text
                        x={pt.x} y={pt.y - r - 5}
                        textAnchor="middle"
                        className="node-label"
                        fill={isDepot ? 'var(--color-primary)' : 'var(--color-text-primary)'}
                      >
                        {isDepot ? 'Depósito' : c.id}
                      </text>
                    </g>
                  );
                })
              }
            </svg>

            {/* overlay instruction */}
            {twoOptHasCrossing && (
              <div
                onClick={twoOptApply}
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(239,68,68,0.9)',
                  color: '#fff',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                ⚠️ Haz clic en el nodo rojo del mapa para desanudar
              </div>
            )}

            {/* Legend */}
            <div className="map-legend">
              <div className="map-legend-item"><div className="map-legend-dot" style={{ background: 'var(--color-primary)' }} /> Depósito</div>
              <div className="map-legend-item"><div className="map-legend-dot" style={{ background: 'var(--color-danger)' }} /> Cruce</div>
              <div className="map-legend-item"><div className="map-legend-dot" style={{ background: 'var(--color-success)' }} /> OK</div>
            </div>
          </div>

          {/* Metrics side panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
            <div className="glass-panel" style={{ padding: '14px', background: 'rgba(255,255,255,0.01)' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Comparativa de Ruta
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Con cruce:</span>
                  <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>{crossedDist} km</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Desanudada:</span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>{optimizedDist} km</span>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  borderTop: '1px solid var(--color-border)', paddingTop: '8px', fontWeight: 700,
                }}>
                  <span>Ahorro:</span>
                  <span style={{ color: 'var(--color-success)' }}>
                    -{saving} km ({(saving / crossedDist * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '12px', background: 'rgba(74,222,128,0.03)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <CheckCircle size={16} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                {twoOptHasCrossing
                  ? 'El camión cruza su propio camino gastando kilometraje extra.'
                  : '¡Tramos invertidos! El cruce fue eliminado y el costo de transporte se redujo.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT: Sidebar ═════════════════════════════════════════════════ */}
      <div className="station-sidebar">
        <TechnicalExplanation
          explicacionTecnica="El algoritmo 2-opt revisa todas las aristas de una ruta y las invierte. Si la distancia resultante es menor que la anterior, guarda el cambio. Esto elimina cruces físicos e ineficiencias que los operadores genéticos globales pueden pasar por alto."
        />

        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={16} style={{ color: 'var(--color-primary)' }} /> Algoritmo Memético
          </h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
            Un <strong>Algoritmo Memético</strong> es un algoritmo genético que incorpora búsqueda local. El AG hace el trabajo global (cruce y mutación) y la búsqueda local 2-opt pule el resultado al final de cada generación, logrando convergencia óptima en tiempo récord.
          </p>
        </div>
      </div>
    </div>
  );
};
