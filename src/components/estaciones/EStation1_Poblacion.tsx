import React from 'react';
import { useAlgorithmStore } from '../../store/useAlgorithmStore';
import { RotateCcw, ArrowRight, Network, CheckCircle } from 'lucide-react';
import { TechnicalExplanation } from '../TechnicalExplanationCard';

// ─── coordinate helpers ───────────────────────────────────────────────────────
// SVG canvas: 500 × 420 units — plenty of room for 8 clients + depot
const VB_W = 500;
const VB_H = 420;
const MARGIN = 50;

function mapCoords(lat: number, lng: number) {
  // lat spans roughly –35 → +30  => scale to [MARGIN, VB_W – MARGIN]
  // lng spans roughly –35 → +45  => scale to [MARGIN, VB_H – MARGIN]
  const latMin = -40, latMax = 35;
  const lngMin = -40, lngMax = 50;
  const x = MARGIN + ((lat - latMin) / (latMax - latMin)) * (VB_W - 2 * MARGIN);
  const y = (VB_H - MARGIN) - ((lng - lngMin) / (lngMax - lngMin)) * (VB_H - 2 * MARGIN);
  return { x, y };
}

// ─── component ───────────────────────────────────────────────────────────────
export const EStation1_Poblacion: React.FC = () => {
  const {
    clientes,
    vehiculos,
    nnActiveTab,
    setNnActiveTab,
    nnCurrentNodeId,
    nnVisitedIds,
    nnRoutes,
    nnCurrentRoute,
    nnCurrentVolume,
    nnStatus,
    nnVehicleIdx,
    nnLog,
    nnStep,
    nnReset,
    nnRunAll,
  } = useAlgorithmStore();

  const activeVehicle = vehiculos[nnVehicleIdx] || vehiculos[vehiculos.length - 1];

  const getNodeColor = (id: string) => {
    if (id === 'DEP') return 'var(--color-primary)';
    if (nnCurrentNodeId === id) return 'var(--color-warn)';
    if (nnVisitedIds.includes(id)) return 'var(--color-success)';
    return 'hsl(225, 8%, 48%)';
  };

  const depotPt = mapCoords(0, 0);
  const ROUTE_COLORS = ['#aa3bff', '#4ade80', '#fb923c'];

  return (
    <div className="station-grid" style={{ height: '100%' }}>

      {/* ═══ LEFT: Main interactive panel ═══════════════════════════════════ */}
      <div className="station-main glass-panel" style={{ padding: '0', overflow: 'hidden' }}>

        {/* ── Tab bar ── */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          padding: '0 20px',
          flexShrink: 0,
        }}>
          {[
            { key: 'interactive', label: '🧩 Constructor Vecino Más Cercano' },
            { key: 'comparative', label: '⚖️ Heurístico vs Aleatorio' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setNnActiveTab(key as 'interactive' | 'comparative')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: nnActiveTab === key ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: nnActiveTab === key ? 'var(--color-primary)' : 'var(--color-text-muted)',
                padding: '12px 16px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '16px', gap: '12px' }}>

          {nnActiveTab === 'interactive' ? (
            <>
              {/* Controls row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Operación Heurística
                  </span>
                  <h4 style={{ margin: '2px 0 0' }}>Construcción de Ruta — Paso a Paso</h4>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary" onClick={nnReset}>
                    <RotateCcw size={14} /> Reiniciar
                  </button>
                  <button className="btn btn-primary" onClick={nnStep} disabled={nnStatus === 'done'}>
                    Paso <ArrowRight size={14} />
                  </button>
                  <button className="btn btn-secondary" onClick={nnRunAll} disabled={nnStatus === 'done'}
                    style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                    Completar
                  </button>
                </div>
              </div>

              {/* Map + side info */}
              <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 220px', gap: '12px' }}>

                {/* SVG MAP — fills the left cell */}
                <div className="map-container">
                  <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet">
                    {/* subtle grid */}
                    <line x1={VB_W / 2} y1="0" x2={VB_W / 2} y2={VB_H} stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />
                    <line x1="0" y1={VB_H / 2} x2={VB_W} y2={VB_H / 2} stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />

                    {/* completed routes */}
                    {nnRoutes.map((route, rIdx) => {
                      const color = ROUTE_COLORS[rIdx % ROUTE_COLORS.length];
                      let last = depotPt;
                      return (
                        <g key={rIdx}>
                          {route.map((nid, i) => {
                            const c = clientes.find(cl => cl.id === nid)!;
                            const pt = mapCoords(c.lat, c.lng);
                            const el = (
                              <line key={i} x1={last.x} y1={last.y} x2={pt.x} y2={pt.y}
                                stroke={color} strokeWidth="2.5" opacity="0.85"
                                strokeDasharray={nnStatus === 'done' ? '0' : '6'} />
                            );
                            last = pt;
                            return el;
                          })}
                          {route.length > 0 && (
                            <line x1={last.x} y1={last.y} x2={depotPt.x} y2={depotPt.y}
                              stroke={color} strokeWidth="2.5" opacity="0.5" />
                          )}
                        </g>
                      );
                    })}

                    {/* active building route */}
                    {nnCurrentRoute.map((nid, i) => {
                      const c = clientes.find(cl => cl.id === nid)!;
                      const pt = mapCoords(c.lat, c.lng);
                      const prev = i === 0
                        ? depotPt
                        : mapCoords(clientes.find(cl => cl.id === nnCurrentRoute[i - 1])!.lat,
                                    clientes.find(cl => cl.id === nnCurrentRoute[i - 1])!.lng);
                      return (
                        <line key={`cur-${i}`} x1={prev.x} y1={prev.y} x2={pt.x} y2={pt.y}
                          stroke="var(--color-warn)" strokeWidth="3" />
                      );
                    })}

                    {/* nodes */}
                    {clientes.map(c => {
                      const pt = mapCoords(c.lat, c.lng);
                      const isDepot = c.id === 'DEP';
                      const isCurrent = c.id === nnCurrentNodeId;
                      const r = isDepot ? 14 : isCurrent ? 11 : 8;

                      return (
                        <g key={c.id}>
                          {/* glow ring for current node */}
                          {isCurrent && (
                            <circle cx={pt.x} cy={pt.y} r={r + 7}
                              fill="none" stroke="var(--color-warn)" strokeWidth="1.5" opacity="0.4" />
                          )}
                          <circle
                            cx={pt.x} cy={pt.y} r={r}
                            fill={getNodeColor(c.id)}
                            stroke={isDepot ? '#fff' : isCurrent ? 'var(--color-warn)' : 'rgba(255,255,255,0.5)'}
                            strokeWidth={isDepot || isCurrent ? 2 : 1}
                            className="map-node"
                          />
                          <text
                            x={pt.x}
                            y={pt.y - r - 5}
                            textAnchor="middle"
                            className="node-label"
                            fill={isCurrent ? 'var(--color-warn)' : isDepot ? 'var(--color-primary)' : 'var(--color-text-primary)'}
                          >
                            {isDepot ? 'Depósito' : c.id}
                          </text>
                          {/* volume hint on depot */}
                          {isDepot && (
                            <text x={pt.x} y={pt.y + r + 14} textAnchor="middle"
                              className="node-label"
                              fontSize="9"
                              fill="var(--color-text-muted)">
                              🏭
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Legend */}
                  <div className="map-legend">
                    <div className="map-legend-item"><div className="map-legend-dot" style={{ background: 'var(--color-primary)' }} /> Depósito</div>
                    <div className="map-legend-item"><div className="map-legend-dot" style={{ background: 'var(--color-warn)' }} /> Actual</div>
                    <div className="map-legend-item"><div className="map-legend-dot" style={{ background: 'var(--color-success)' }} /> Visitado</div>
                    <div className="map-legend-item"><div className="map-legend-dot" style={{ background: 'hsl(225,8%,48%)' }} /> Pendiente</div>
                  </div>
                </div>

                {/* Side: log + vehicle status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 }}>
                  {/* Log */}
                  <div className="glass-panel" style={{
                    padding: '12px',
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    background: 'rgba(255,255,255,0.01)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                  }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', flexShrink: 0 }}>
                      Log de Construcción
                    </span>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {nnLog.slice(-6).map((log, li) => (
                        <div key={li} style={{ color: li === nnLog.slice(-6).length - 1 ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                          ➔ {log}
                        </div>
                      ))}
                      {nnLog.length === 0 && (
                        <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Presiona "Paso" para comenzar…</div>
                      )}
                    </div>
                  </div>

                  {/* Vehicle card */}
                  <div className="glass-panel" style={{ padding: '12px', background: 'rgba(170,59,255,0.04)', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                      Camión Activo
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{activeVehicle.nombre}</div>
                    <div style={{ marginTop: '6px', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Capacidad usada:</span>
                      <strong style={{
                        color: nnCurrentVolume > activeVehicle.capacidad_volumen
                          ? 'var(--color-danger)'
                          : 'var(--color-success)',
                      }}>
                        {nnCurrentVolume.toFixed(1)} / {activeVehicle.capacidad_volumen} m³
                      </strong>
                    </div>
                    {/* Capacity bar */}
                    <div style={{ marginTop: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', height: '5px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, (nnCurrentVolume / activeVehicle.capacidad_volumen) * 100)}%`,
                        background: nnCurrentVolume > activeVehicle.capacidad_volumen ? 'var(--color-danger)' : 'var(--color-success)',
                        transition: 'width 0.4s ease',
                        borderRadius: '4px',
                      }} />
                    </div>
                  </div>

                  {/* Status badge */}
                  {nnStatus === 'done' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'var(--color-success-glow)', border: '1px solid hsla(142,71%,45%,0.3)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem' }}>
                      <CheckCircle size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                      <span>¡Todas las rutas completadas!</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* ── COMPARATIVE TAB ──────────────────────────────── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '4px' }}>
              <h4 style={{ margin: 0, flexShrink: 0 }}>¿Por qué inyectar Heurística en la Población Inicial?</h4>
              <p style={{ fontSize: '0.83rem', color: 'var(--color-text-secondary)', lineHeight: '1.55', flexShrink: 0 }}>
                El 80 % de nuestra población se baraja al azar para explorar rutas inesperadas. Sin embargo, si toda la población fuera 100 % aleatoria, el algoritmo tardaría mucho en encontrar orden. Por eso, el 20 % se genera con heurísticas como Vecino Más Cercano.
              </p>

              <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Heuristic */}
                <div className="glass-panel" style={{
                  padding: '14px',
                  background: 'rgba(74,222,128,0.03)',
                  border: '1px solid rgba(74,222,128,0.18)',
                  display: 'flex', flexDirection: 'column', gap: '10px'
                }}>
                  <span className="badge badge-success" style={{ alignSelf: 'flex-start' }}>20% Heurístico</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    Rutas lógicas sin cruces absurdos. El camión avanza agrupando clientes geográficamente cercanos.
                  </span>
                  <div style={{ flex: 1, minHeight: 0 }}>
                    <svg width="100%" height="100%" viewBox="0 0 300 220" style={{ display: 'block', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                      <path d="M150 110 L180 60 L240 80 L250 150 L190 170 L120 175 L60 145 L50 70 L110 50 Z"
                        fill="none" stroke="var(--color-success)" strokeWidth="2.5" />
                      <circle cx="150" cy="110" r="8" fill="var(--color-primary)" stroke="#fff" strokeWidth="1.5" />
                      {[[180,60],[240,80],[250,150],[190,170],[120,175],[60,145],[50,70],[110,50]].map(([cx,cy],i) =>
                        <circle key={i} cx={cx} cy={cy} r="5" fill="var(--color-success)" stroke="#fff" strokeWidth="1" />)}
                    </svg>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>
                    <span>Distancia estimada:</span>
                    <span style={{ color: 'var(--color-success)' }}>~240 km ✓</span>
                  </div>
                </div>

                {/* Random */}
                <div className="glass-panel" style={{
                  padding: '14px',
                  display: 'flex', flexDirection: 'column', gap: '10px'
                }}>
                  <span className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>80% Aleatorio</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    Cruces constantes (efecto spaghetti). El camión viaja de un extremo a otro perdiendo combustible.
                  </span>
                  <div style={{ flex: 1, minHeight: 0 }}>
                    <svg width="100%" height="100%" viewBox="0 0 300 220" style={{ display: 'block', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                      <path d="M150 110 L250 150 L50 70 L240 80 L60 145 L180 60 L120 175 L110 50 L190 170 Z"
                        fill="none" stroke="var(--color-danger)" strokeWidth="1.8" opacity="0.9" />
                      <circle cx="150" cy="110" r="8" fill="var(--color-primary)" stroke="#fff" strokeWidth="1.5" />
                      {[[180,60],[240,80],[250,150],[190,170],[120,175],[60,145],[50,70],[110,50]].map(([cx,cy],i) =>
                        <circle key={i} cx={cx} cy={cy} r="5" fill="hsl(225,8%,50%)" stroke="#fff" strokeWidth="1" />)}
                    </svg>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>
                    <span>Distancia estimada:</span>
                    <span style={{ color: 'var(--color-danger)' }}>~550 km ✗</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ RIGHT: Sidebar ══════════════════════════════════════════════════ */}
      <div className="station-sidebar">
        <TechnicalExplanation
          explicacionTecnica="La inicialización híbrida mezcla el 80 % de aleatoriedad (para explorar sin sesgos) con un 20 % heurístico (para guiar al algoritmo desde el inicio). En el laboratorio interactivo del Vecino Más Cercano puedes construir paso a paso la ruta seleccionando sucesivamente al cliente más cercano no visitado, respetando la capacidad máxima del camión."
        />

        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network size={16} style={{ color: 'var(--color-primary)' }} /> Flota en Depósito
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
            {vehiculos.map((v, idx) => (
              <div key={v.id} style={{
                display: 'flex', justifyContent: 'space-between', padding: '7px 10px',
                background: idx === nnVehicleIdx && nnStatus !== 'done' ? 'rgba(170,59,255,0.1)' : 'rgba(255,255,255,0.01)',
                borderRadius: '8px',
                border: idx === nnVehicleIdx && nnStatus !== 'done' ? '1px solid var(--color-primary)' : '1px solid transparent',
                transition: 'all var(--transition-fast)',
              }}>
                <span>🚚 {v.nombre}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>{v.capacidad_volumen} m³</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
