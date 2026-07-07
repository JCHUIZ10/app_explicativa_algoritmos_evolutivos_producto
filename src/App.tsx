import { useAlgorithmStore } from './store/useAlgorithmStore';
import { GlobalLayout } from './components/GlobalLayout';
import { AnalogyCard } from './components/AnalogyCard';
import { Play, Settings, Zap, Users, Compass, Eye, TrendingUp } from 'lucide-react';

function App() {
  const {
    currentStation,
    clientes,
    vehiculos,
    maxGeneraciones,
    poblacionSize,
    cruceProb,
    mutacionProb,
    alpha,
    beta,
    setParams,
    runAlgorithmLocal,
    isGenerating,
    generaciones,
    currentGenerationIdx,
    selectedCromosomaId,
    setSelectedCromosomaId,
    resultadoFinal
  } = useAlgorithmStore();

  const currentGenData = generaciones[currentGenerationIdx];
  const hasData = generaciones.length > 0;

  // Renders the views for each station
  const renderStationContent = () => {
    switch (currentStation) {
      case 0: // Configuración
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', height: '100%' }}>
            {/* Form de Parámetros */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                <Settings size={20} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ margin: 0 }}>Ajustar Parámetros Evolutivos</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Tamaño de Población: <span style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{poblacionSize}</span>
                </label>
                <input 
                  type="range" min={10} max={100} step={5} value={poblacionSize} 
                  onChange={(e) => setParams({ poblacionSize: parseInt(e.target.value) })}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Número de soluciones compitiendo simultáneamente.</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Generaciones Máximas: <span style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{maxGeneraciones}</span>
                </label>
                <input 
                  type="range" min={10} max={200} step={10} value={maxGeneraciones} 
                  onChange={(e) => setParams({ maxGeneraciones: parseInt(e.target.value) })}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Límite de iteraciones del ciclo evolutivo.</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Probabilidad de Cruce (BCRC): <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>{Math.round(cruceProb * 100)}%</span>
                </label>
                <input 
                  type="range" min={0.1} max={1.0} step={0.05} value={cruceProb} 
                  onChange={(e) => setParams({ cruceProb: parseFloat(e.target.value) })}
                  style={{ accentColor: 'var(--color-success)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Probabilidad de Mutación: <span style={{ color: 'var(--color-danger)', fontFamily: 'var(--font-mono)' }}>{Math.round(mutacionProb * 100)}%</span>
                </label>
                <input 
                  type="range" min={0.01} max={0.5} step={0.01} value={mutacionProb} 
                  onChange={(e) => setParams({ mutacionProb: parseFloat(e.target.value) })}
                  style={{ accentColor: 'var(--color-danger)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Penalidad de Capacidad (α): <span style={{ color: 'var(--color-warn)', fontFamily: 'var(--font-mono)' }}>{alpha}</span>
                </label>
                <input 
                  type="range" min={10} max={300} step={10} value={alpha} 
                  onChange={(e) => setParams({ alpha: parseInt(e.target.value) })}
                  style={{ accentColor: 'var(--color-warn)' }}
                />
              </div>

              <button 
                onClick={runAlgorithmLocal}
                className="btn btn-primary"
                style={{ marginTop: '10px', height: '48px' }}
                disabled={isGenerating}
              >
                <Play size={18} /> {isGenerating ? 'Evolucionando...' : 'Iniciar Simulación Evolutiva'}
              </button>
            </div>

            {/* Resumen del problema */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <AnalogyCard 
                titulo="Estación 0 — Configurando el Escenario"
                analogia="Estás organizando el equipo antes del partido. Eliges cuántos camiones tienes (jugadores), qué tan grandes son (capacidad), y qué tan estricto será el árbitro con las infracciones (α y β)."
                explicacionTecnica="Definimos los parámetros de entrada del algoritmo genético. En un problema de ruteo real con ventanas de tiempo y flota heterogénea (CVRPTW), el algoritmo requiere calibrar el tamaño del lote de soluciones, la probabilidad de reproducirse (crossover) o mutar, y los castigos numéricos (alpha y beta) por exceder carga o jornada."
                metaforaVisual="Controladores de simulación interactivos para calibrar la genética."
              />

              <div className="glass-panel" style={{ padding: '20px', flex: 1 }}>
                <h4 style={{ marginBottom: '12px' }}>Datos Iniciales</h4>
                <div style={{ display: 'flex', justifyContent: 'space-around', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)', flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Clientes Activos</span>
                    <strong style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }}>{clientes.length - 1}</strong>
                  </div>
                  <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)', flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Flota Activa</span>
                    <strong style={{ fontSize: '1.5rem', color: 'var(--color-success)' }}>{vehiculos.length}</strong>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem' }}>
                  <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', marginBottom: '6px', fontWeight: 600 }}>Vehículos Disponibles:</div>
                  {vehiculos.map(v => (
                    <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: 'var(--color-text-secondary)' }}>
                      <span>🚚 {v.nombre} ({v.tipo})</span>
                      <span>Cap: <strong>{v.capacidad_volumen} m³</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 1: // Población
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', height: '100%' }}>
            <div className="glass-panel" style={{ padding: '24px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={20} /> Población de Soluciones</h3>
                <span className="badge badge-primary">Gen {currentGenerationIdx + 1}</span>
              </div>
              
              {!hasData ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Por favor ve a la <strong>Estación 0</strong> e inicia la simulación para generar la población.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                  {currentGenData.poblacion_snapshot.map((ind) => {
                    const isBest = ind.id === 0;
                    return (
                      <div 
                        key={ind.id} 
                        onClick={() => setSelectedCromosomaId(ind.id)}
                        className="pulse-glow"
                        style={{
                          background: selectedCromosomaId === ind.id ? 'rgba(170, 59, 255, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                          border: `1px solid ${selectedCromosomaId === ind.id ? 'var(--color-primary)' : isBest ? 'var(--color-success)' : 'var(--color-border)'}`,
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Solución #{ind.id + 1}</span>
                          {isBest && <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>El Mejor</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '4px', marginBottom: '8px' }}>
                          {ind.cromosoma.join(', ')}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                          <span>Aptitud:</span>
                          <strong style={{ color: 'var(--color-primary)' }}>{ind.fitness.toFixed(6)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                          <span>Distancia:</span>
                          <strong>{ind.distancia} km</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <AnalogyCard 
                titulo="Estación 1 — Población Inicial"
                analogia="Imagina que necesitas armar 120 listas de reparto para el mismo set de clientes. El 20% lo arma tu repartidor más experimentado siguiendo la ruta más inteligente que conoce. El 80% restante es como barajan y reparten las cartas: rutas completamente aleatorias."
                explicacionTecnica="La inicialización híbrida combina heurística Clarke-Wright (20% para asegurar genes con distancias cortas) y generación aleatoria pura (80% para mantener alta diversidad genética). Cada cromosoma representa la secuencia de clientes a visitar separados por números no positivos que delimitan qué camión se encarga de qué segmento."
                metaforaVisual="Mazo de cartas distribuidas."
              />

              {hasData && selectedCromosomaId !== null && (
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <h4 style={{ marginBottom: '10px', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>Inspección del Cromosoma</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)' }}>Cromosoma Completo:</span>
                      <div style={{ fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: 'var(--radius-sm)', marginTop: '4px', wordBreak: 'break-all' }}>
                        [{currentGenData.poblacion_snapshot[selectedCromosomaId]?.cromosoma.join(', ')}]
                      </div>
                    </div>
                    <div>
                      <strong>Rutas Delimitadas:</strong>
                      {currentGenData.poblacion_snapshot[selectedCromosomaId]?.rutas.map((r, idx) => (
                        <div key={idx} style={{ padding: '4px 0', borderBottom: '1px dashed rgba(255,255,255,0.05)' }}>
                          🚚 Ruta Camión {idx + 1}: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>[{r.join(' ➔ ')}]</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 2: // Evaluación
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', height: '100%' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Eye size={20} /> Evaluación de Aptitud (Fitness)</h3>
                <span className="badge badge-success">Estación Activa</span>
              </div>
              
              {!hasData ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Por favor ve a la <strong>Estación 0</strong> e inicia la simulación para evaluar aptitudes.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ marginBottom: '8px' }}>Ecuación de Calificación (Costo):</h4>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', color: 'var(--color-primary)', textAlign: 'center', padding: '10px 0' }}>
                      Costo = Distancia + (α × Exceso Carga) + (β × Exceso Tiempo)
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                      La aptitud (Fitness) es el inverso del costo: <strong>1 / Costo</strong>. A menor costo total, mejor calificado el cromosoma.
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--color-border)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                      <h5>Métricas del Mejor Individuo</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Aptitud:</span>
                          <strong style={{ color: 'var(--color-success)' }}>{currentGenData.poblacion_snapshot[0].fitness.toFixed(6)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Distancia:</span>
                          <strong>{currentGenData.poblacion_snapshot[0].distancia} km</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Exceso Carga:</span>
                          <strong style={{ color: currentGenData.poblacion_snapshot[0].exceso_capacidad > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                            {currentGenData.poblacion_snapshot[0].exceso_capacidad} m³
                          </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Exceso Jornada:</span>
                          <strong style={{ color: currentGenData.poblacion_snapshot[0].exceso_tiempo > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                            {currentGenData.poblacion_snapshot[0].exceso_tiempo} min
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--color-border)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                      <h5>Penalizaciones del Algoritmo</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Peso Capacidad (α):</span>
                          <strong style={{ color: 'var(--color-warn)' }}>{alpha}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Peso Jornada (β):</span>
                          <strong style={{ color: 'var(--color-warn)' }}>{beta}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Regla del Almuerzo:</span>
                          <span>+60 min (entre 240 y 360 min)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <AnalogyCard 
                titulo="Estación 2 — Evaluación de Aptitud"
                analogia="Le ponemos una calificación a cada lista de reparto. Sumamos el kilometraje total recorrido, más una multa si un camión lleva más de lo que aguanta, más otra multa si el conductor trabaja más de 8 horas. La lista que tenga la calificación más baja de costos obtiene la puntuación más alta."
                explicacionTecnica="La función de aptitud mide qué tan apto es un cromosoma. La penalidad de capacidad se activa de forma heterogénea comparando la suma de volúmenes de clientes de una ruta con la capacidad del vehículo asignado. La penalidad de jornada laboral se activa si el tiempo acumulado de conducción, servicio y almuerzo supera los 480 minutos."
                metaforaVisual="Carrera de obstáculos con multas acumulativas."
              />
            </div>
          </div>
        );

      case 3: // Selección
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', height: '100%' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={20} /> Selección por Torneo</h3>
                <span className="badge badge-primary">Tamaño Torneo k=3</span>
              </div>

              <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ textAlign: 'center' }}>¿Cómo funciona el Torneo k=3?</h4>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', margin: '20px 0' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center', width: '100px' }}>
                    <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--color-text-muted)' }}>Candidato 1</span>
                    <strong style={{ color: 'var(--color-danger)' }}>Fit: Low</strong>
                  </div>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>vs</span>
                  <div style={{ background: 'rgba(170, 59, 255, 0.1)', padding: '16px', borderRadius: 'var(--radius-md)', border: '2px solid var(--color-primary)', textAlign: 'center', width: '110px', transform: 'scale(1.1)' }}>
                    <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--color-primary)' }}>Ganador</span>
                    <strong style={{ color: 'var(--color-success)', fontSize: '1.1rem' }}>Fit: High</strong>
                  </div>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>vs</span>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center', width: '100px' }}>
                    <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--color-text-muted)' }}>Candidato 3</span>
                    <strong style={{ color: 'var(--color-warn)' }}>Fit: Mid</strong>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                  De forma aleatoria se extraen 3 individuos de la población actual. El de mayor aptitud tiene derecho a convertirse en "Padre" y pasar sus genes. Esto previene que las malas soluciones se apoderen, pero da una pequeña probabilidad de diversidad.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <AnalogyCard 
                titulo="Estación 3 — Selección por Torneo"
                analogia="De los 120 mazos de cartas, sacamos 3 al azar a un ring de combate. Los comparamos frente a frente: el que tenga la mejor calificación de reparto ¡gana el torneo y pasa a la siguiente ronda! Los perdedores se descartan."
                explicacionTecnica="El operador tournament_selection(k=3) balancea la presión de selección con la diversidad. Si el torneo fuese muy grande (e.g. k=10), solo las soluciones top se reproducirían, colapsando la diversidad. Si fuese k=1, sería selección puramente aleatoria."
                metaforaVisual="Tres gladiadores o cartas compitiendo en el ring."
              />
            </div>
          </div>
        );

      case 4: // Cruce BCRC
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', height: '100%' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Compass size={20} /> Cruce por Mejor Costo (BCRC)</h3>
                <span className="badge badge-primary">Probabilidad 85%</span>
              </div>

              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ marginBottom: '8px' }}>El trasplante genético del BCRC:</h4>
                <div style={{ border: '1px solid var(--color-border)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '0.85rem' }}>Padre 1:</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                    [1, 2, <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>3, 4</span>, -0, 5, 6] (Extraemos la sub-ruta del camión 1: <strong style={{ color: 'var(--color-success)' }}>[3, 4]</strong>)
                  </div>
                </div>

                <div style={{ border: '1px solid var(--color-border)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--color-warn)', fontWeight: 'bold', fontSize: '0.85rem' }}>Padre 2 (Limpio):</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                    [2, -0, 5, 6] (Eliminamos los clientes <strong style={{ color: 'var(--color-success)' }}>3 y 4</strong> para evitar duplicados)
                  </div>
                </div>

                <div style={{ border: '1px solid var(--color-border)', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(170, 59, 255, 0.05)' }}>
                  <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '0.85rem' }}>Hijo (Re-insertado):</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                    [2, -0, 5, <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>3</span>, 6, <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>4</span>] (Insertamos en las ranuras de menor costo local)
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <AnalogyCard 
                titulo="Estación 4 — Crossover BCRC"
                analogia="El Padre1 tiene una ruta brillante para el sur de la ciudad. Le 'donamos' esa ruta completa al Padre2. Pero el Padre2 ya tenía asignados esos clientes de otra manera, así que hay que sacarlos y recolocarlos en el lugar donde menos 'cuesta' insertarlos."
                explicacionTecnica="El cruce de rutas de mejor costo (Best Cost Route Crossover - BCRC) es el operador ideal para VRP ya que respeta los agrupamientos espaciales de los clientes y evita corromper la validez del cromosoma en permutación."
                metaforaVisual="Piezas de rompecabezas de rutas acoplándose."
              />
            </div>
          </div>
        );

      case 5: // Mutación
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', height: '100%' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={20} /> Mutación Híbrida</h3>
                <span className="badge badge-primary">Probabilidad 15%</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--color-border)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ marginBottom: '8px', color: 'var(--color-primary)' }}>1. Mutación Swap (50%)</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                    Intercambia aleatoriamente dos genes de posición. Puede mover paradas entre camiones o cambiar el número de vehículos activos si se toca un delimitador.
                  </p>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '4px' }}>
                    [1, <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>2</span>, -0, 4, <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>5</span>] <br />
                    ➔ [1, <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>5</span>, -0, 4, <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>2</span>]
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--color-border)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ marginBottom: '8px', color: 'var(--color-info)' }}>2. Mutación Or-opt (50%)</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                    Extrae un bloque de 1 a 3 clientes de una ruta origen y lo inserta en otra ruta en una posición aleatoria para evaluar vecindades cercanas.
                  </p>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '4px' }}>
                    [1, <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>2, 3</span>, -0, 4] <br />
                    ➔ [1, -0, 4, <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>2, 3</span>]
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <AnalogyCard 
                titulo="Estación 5 — Mutación Híbrida"
                analogia="Swap: Un repartidor despistado cambia de lugar dos paradas del itinerario por accidente. Or-opt: Alguien decide que 3 clientes del barrio norte están muy agrupados y los mueve todos juntos a otro camión."
                explicacionTecnica="La mutación híbrida es crítica para la diversidad poblacional. Evita el estancamiento y la convergencia prematura en óptimos locales al inyectar ruido aleatorio con una probabilidad moderada del 15%."
                metaforaVisual="Intercambio curvo de genes o bloques voladores."
              />
            </div>
          </div>
        );

      case 6: // Búsqueda Local
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', height: '100%' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Compass size={20} /> Búsqueda Local (2-opt)</h3>
                <span className="badge badge-success">Optimización Memética</span>
              </div>

              <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4>Eliminación de Cruces (Zig-Zag)</h4>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', margin: '10px 0' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8rem', display: 'block', color: 'var(--color-danger)' }}>Antes (Con Cruce)</span>
                    <svg width="100" height="80" style={{ border: '1px dashed rgba(255,255,255,0.1)', marginTop: '8px' }}>
                      <line x1="10" y1="10" x2="90" y2="70" stroke="var(--color-danger)" strokeWidth="2" />
                      <line x1="10" y1="70" x2="90" y2="10" stroke="var(--color-danger)" strokeWidth="2" />
                    </svg>
                  </div>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>➔</span>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8rem', display: 'block', color: 'var(--color-success)' }}>Después (2-opt invertido)</span>
                    <svg width="100" height="80" style={{ border: '1px dashed rgba(255,255,255,0.1)', marginTop: '8px' }}>
                      <line x1="10" y1="10" x2="10" y2="70" stroke="var(--color-success)" strokeWidth="2" />
                      <line x1="90" y1="10" x2="90" y2="70" stroke="var(--color-success)" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  A nivel de ruta de cada vehículo, el algoritmo 2-opt toma dos conexiones y las invierte. Si la distancia total de la ruta disminuye al deshacer este cruce, la inversión se guarda. En nuestro optimizador memético se ejecuta con una probabilidad pequeña del 10% para acelerar convergencia.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <AnalogyCard 
                titulo="Estación 6 — Búsqueda Local 2-opt"
                analogia="Después de nacer, el 'hijo' va al gimnasio. Un entrenador experto (2-opt) mira su ruta y dice: '¡Oye, estás haciendo un zigzag innecesario!' Entonces invierte ese tramo para eliminar el cruce."
                explicacionTecnica="El algoritmo memético combina la búsqueda global evolutiva (algoritmo genético) con la búsqueda local heurística (2-opt). Esto acelera enormemente la obtención de soluciones de altísima calidad eliminando ineficiencias locales."
                metaforaVisual="Ruta con cruces que se desanuda."
              />
            </div>
          </div>
        );

      case 7: // Convergencia
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', height: '100%' }}>
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={20} /> Gráfica de Convergencia</h3>
                <span className="badge badge-success">Resultados Finales</span>
              </div>

              {!hasData ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Por favor ve a la <strong>Estación 0</strong> e inicia la simulación para ver la convergencia.
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)', flex: 1, textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Generaciones Totales</span>
                      <strong style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }}>{resultadoFinal?.generacion_final || generaciones.length}</strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)', flex: 1, textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Mejor Fitness Alcanzado</span>
                      <strong style={{ fontSize: '1.5rem', color: 'var(--color-success)' }}>
                        {resultadoFinal?.mejor_fitness.toFixed(6)}
                      </strong>
                    </div>
                  </div>

                  <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', alignItems: 'flex-end', gap: '4px', height: '180px' }}>
                    {generaciones.map((g, idx) => {
                      const maxFit = Math.max(...generaciones.map(g => g.mejor_fitness_global));
                      const minFit = Math.min(...generaciones.map(g => g.mejor_fitness_global));
                      const heightPct = maxFit === minFit ? 100 : ((g.mejor_fitness_global - minFit) / (maxFit - minFit)) * 80 + 20;
                      
                      return (
                        <div 
                          key={idx}
                          title={`Gen ${g.generacion}: ${g.mejor_fitness_global.toFixed(6)}`}
                          style={{
                            flex: 1,
                            height: `${heightPct}%`,
                            background: idx === currentGenerationIdx ? 'var(--color-primary)' : 'rgba(170, 59, 255, 0.4)',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            transition: 'height 0.3s ease'
                          }}
                          onClick={() => useAlgorithmStore.getState().setCurrentGenerationIdx(idx)}
                        />
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    Cada barra representa el mejor fitness alcanzado en esa generación. Haz clic en una barra para ver la población de esa generación.
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <AnalogyCard 
                titulo="Estación 7 — Convergencia"
                analogia="Generación tras generación, la especie de 'listas de reparto' va mejorando. Los 3 mejores siempre sobreviven. Cuando ya nadie mejora por muchas generaciones seguidas, el algoritmo se detiene."
                explicacionTecnica="El gráfico muestra cómo el fitness global progresa monótonamente (hacia arriba) gracias al elitismo y la selección orientada a la aptitud. Cuando el fitness se aplana, decimos que el algoritmo ha convergido a un óptimo."
                metaforaVisual="Gráfico de evolución y supervivencia."
              />

              {resultadoFinal && (
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <h4 style={{ marginBottom: '10px' }}>Rutas Óptimas por Camión</h4>
                  {Object.entries(resultadoFinal.rutas_vehiculos).map(([vehId, r]) => (
                    <div key={vehId} style={{ fontSize: '0.8rem', padding: '6px 0', borderBottom: '1px dashed rgba(255,255,255,0.05)' }}>
                      <strong>🚚 {vehId}:</strong> {r.secuencia_visitas.join(' ➔ ')} <br />
                      <span style={{ color: 'var(--color-text-muted)' }}>Dist: {r.distancia_estimada_km} km | Tiempo: {r.tiempo_estimado_minutos} min | Carga: {r.volumen_total} m³ ({r.utilization_pct}%)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return <div>Estación no implementada</div>;
    }
  };

  return (
    <GlobalLayout>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {renderStationContent()}
      </div>
    </GlobalLayout>
  );
}

export default App;
