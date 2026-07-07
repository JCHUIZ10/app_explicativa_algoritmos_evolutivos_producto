import { create } from 'zustand';
import type { Cliente, Vehiculo, GeneracionData, ResultadoFinal, CromosomaInfo, OperacionDetalle } from '../types';

interface AlgorithmState {
  // Config
  clientes: Cliente[];
  vehiculos: Vehiculo[];
  maxGeneraciones: number;
  poblacionSize: number;
  cruceProb: number;
  mutacionProb: number;
  alpha: number;
  beta: number;

  // Playback State
  currentStation: number; // 0 = Config, 1 = Poblacion, 2 = Evaluacion, 3 = Seleccion, 4 = Cruce, 5 = Mutacion, 6 = LocalSearch, 7 = Convergencia
  isPlaying: boolean;
  playbackSpeed: number; // 1 = 1x, 2 = 2x, 0.5 = 0.5x
  currentGenerationIdx: number;
  generaciones: GeneracionData[];
  resultadoFinal: ResultadoFinal | null;
  selectedCromosomaId: number | null; // Id of chromosome selected to inspect details
  isGenerating: boolean;

  // Actions
  setClientes: (clientes: Cliente[]) => void;
  setVehiculos: (vehiculos: Vehiculo[]) => void;
  setParams: (params: { maxGeneraciones?: number; poblacionSize?: number; cruceProb?: number; mutacionProb?: number; alpha?: number; beta?: number }) => void;
  setCurrentStation: (station: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setCurrentGenerationIdx: (idx: number) => void;
  setSelectedCromosomaId: (id: number | null) => void;
  
  // Execution Control
  runAlgorithmLocal: () => void;
  resetAlgorithm: () => void;
  stepForward: () => void;
  stepBackward: () => void;
}

// Initial Mock Data
const MOCK_CLIENTES: Cliente[] = [
  { id: 'DEP', nombre: 'Depósito Central', volumen: 0, lat: 0, lng: 0, tiempo_servicio: 0 },
  { id: 'CLI-01', nombre: 'Tienda El Bosque', volumen: 4.2, lat: 10, lng: 20, tiempo_servicio: 10 },
  { id: 'CLI-02', nombre: 'Supermercado Norte', volumen: 12.5, lat: -15, lng: 30, tiempo_servicio: 20 },
  { id: 'CLI-03', nombre: 'Abarrotes Sur', volumen: 3.1, lat: 35, lng: -10, tiempo_servicio: 10 },
  { id: 'CLI-04', nombre: 'Distribuidora Este', volumen: 18.0, lat: -5, lng: -25, tiempo_servicio: 35 },
  { id: 'CLI-05', nombre: 'Minimarket Alameda', volumen: 6.7, lat: 20, lng: 40, tiempo_servicio: 20 },
  { id: 'CLI-06', nombre: 'Panadería Central', volumen: 2.5, lat: -30, lng: -15, tiempo_servicio: 10 },
  { id: 'CLI-07', nombre: 'Restaurante Portal', volumen: 11.0, lat: 25, lng: -35, tiempo_servicio: 20 },
  { id: 'CLI-08', nombre: 'Farmacia San Juan', volumen: 5.0, lat: -25, lng: 25, tiempo_servicio: 10 },
  { id: 'CLI-09', nombre: 'Bodega El Porvenir', volumen: 8.3, lat: 5, lng: 35, tiempo_servicio: 20 },
  { id: 'CLI-10', nombre: 'Tienda del Parque', volumen: 15.5, lat: 30, lng: 15, tiempo_servicio: 35 },
];

const MOCK_VEHICULOS: Vehiculo[] = [
  { id: 'VEH-01', nombre: 'Camión Grande Alpha', capacidad_volumen: 30, tipo: 'Grande' },
  { id: 'VEH-02', nombre: 'Camión Mediano Beta', capacidad_volumen: 20, tipo: 'Mediano' },
  { id: 'VEH-03', nombre: 'Van de Reparto Gamma', capacidad_volumen: 12, tipo: 'Pequeño' },
];

export const useAlgorithmStore = create<AlgorithmState>((set, get) => {
  
  // Helper to calculate Euclidean distances (simplified from Haversine for mock grid coordinate visuals)
  const getDist = (c1: Cliente, c2: Cliente) => {
    return Math.sqrt(Math.pow(c1.lat - c2.lat, 2) + Math.pow(c1.lng - c2.lng, 2));
  };

  // Helper to evaluate a mock chromosome
  const evaluateMockChromosome = (cromosoma: number[]): { fitness: number; distancia: number; exceso_capacidad: number; exceso_tiempo: number } => {
    const { clientes, vehiculos, alpha, beta } = get();
    const M = vehiculos.length;
    
    // Split routes by <= 0 values (separators)
    const routes: number[][] = [];
    let currentRoute: number[] = [];
    for (const gene of cromosoma) {
      if (gene <= 0) {
        routes.push(currentRoute);
        currentRoute = [];
      } else {
        currentRoute.push(gene);
      }
    }
    routes.push(currentRoute);
    
    while (routes.length < M) {
      routes.push([]);
    }
    
    let totalDist = 0;
    let totalCapExcess = 0;
    let totalTimeExcess = 0;
    
    routes.forEach((route, k) => {
      if (k >= M) return;
      const capacity = vehiculos[k].capacidad_volumen;
      let routeCap = 0;
      let routeTime = 0;
      let lastNode = clientes[0]; // Depósito
      
      route.forEach(clientIdx => {
        const client = clientes[clientIdx];
        totalDist += getDist(lastNode, client);
        routeTime += getDist(lastNode, client) * 1.5; // distance-to-time conversion
        routeCap += client.volumen;
        
        // Add service time
        routeTime += client.tiempo_servicio;
        
        // Lunch brake injection between 240 and 360 min
        if (routeTime >= 240 && routeTime <= 360) {
          routeTime += 60; // 60 min lunch
        }
        
        lastNode = client;
      });
      
      // Return to depot
      totalDist += getDist(lastNode, clientes[0]);
      routeTime += getDist(lastNode, clientes[0]) * 1.5;
      
      if (routeCap > capacity) {
        totalCapExcess += (routeCap - capacity);
      }
      if (routeTime > 480) {
        totalTimeExcess += (routeTime - 480);
      }
    });
    
    const cost = totalDist + (alpha * totalCapExcess) + (beta * totalTimeExcess);
    const fitness = cost > 0 ? 1 / cost : 0;
    
    return {
      fitness,
      distancia: Math.round(totalDist * 100) / 100,
      exceso_capacidad: Math.round(totalCapExcess * 100) / 100,
      exceso_tiempo: Math.round(totalTimeExcess * 100) / 100,
    };
  };

  // Helper to split route for return
  const splitRoutes = (cromosoma: number[], numVehicles: number): number[][] => {
    const routes: number[][] = [];
    let currentRoute: number[] = [];
    for (const gene of cromosoma) {
      if (gene <= 0) {
        routes.push(currentRoute);
        currentRoute = [];
      } else {
        currentRoute.push(gene);
      }
    }
    routes.push(currentRoute);
    while (routes.length < numVehicles) {
      routes.push([]);
    }
    return routes.slice(0, numVehicles);
  };

  return {
    // Initial Config
    clientes: MOCK_CLIENTES,
    vehiculos: MOCK_VEHICULOS,
    maxGeneraciones: 50,
    poblacionSize: 40, // 40 is optimal for visual loading and smoothness in educational step-by-step
    cruceProb: 0.85,
    mutacionProb: 0.15,
    alpha: 150,
    beta: 75,

    // Playback State
    currentStation: 0,
    isPlaying: false,
    playbackSpeed: 1,
    currentGenerationIdx: 0,
    generaciones: [],
    resultadoFinal: null,
    selectedCromosomaId: null,
    isGenerating: false,

    // Setters
    setClientes: (clientes) => set({ clientes }),
    setVehiculos: (vehiculos) => set({ vehiculos }),
    setParams: (params) => set((state) => ({ ...state, ...params })),
    setCurrentStation: (currentStation) => set({ currentStation }),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
    setCurrentGenerationIdx: (currentGenerationIdx) => set({ currentGenerationIdx }),
    setSelectedCromosomaId: (selectedCromosomaId) => set({ selectedCromosomaId }),

    resetAlgorithm: () => set({
      isPlaying: false,
      currentGenerationIdx: 0,
      generaciones: [],
      resultadoFinal: null,
      selectedCromosomaId: null,
      currentStation: 0,
    }),

    stepForward: () => {
      const { currentGenerationIdx, generaciones } = get();
      if (currentGenerationIdx < generaciones.length - 1) {
        set({ currentGenerationIdx: currentGenerationIdx + 1 });
      }
    },

    stepBackward: () => {
      const { currentGenerationIdx } = get();
      if (currentGenerationIdx > 0) {
        set({ currentGenerationIdx: currentGenerationIdx - 1 });
      }
    },

    // Generates a mock run directly in JavaScript to allow instant offline interactive play
    runAlgorithmLocal: () => {
      set({ isGenerating: true, currentGenerationIdx: 0, generaciones: [] });
      const { clientes, vehiculos, maxGeneraciones, poblacionSize, cruceProb, mutacionProb } = get();
      const numClients = clientes.length - 1; // excluding depot
      const numVehicles = vehiculos.length;

      // 1. Initial Population
      let population: CromosomaInfo[] = [];
      const separators = Array.from({ length: numVehicles - 1 }, (_, i) => -i); // 0, -1, -2...
      
      for (let i = 0; i < poblacionSize; i++) {
        // Shuffle clients and separators
        const genes = Array.from({ length: numClients }, (_, idx) => idx + 1);
        const fullGenes = [...genes, ...separators];
        // Shuffle
        for (let j = fullGenes.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [fullGenes[j], fullGenes[k]] = [fullGenes[k], fullGenes[j]];
        }
        
        const evaluation = evaluateMockChromosome(fullGenes);
        population.push({
          id: i,
          cromosoma: fullGenes,
          rutas: splitRoutes(fullGenes, numVehicles),
          ...evaluation
        });
      }

      const generationsHistory: GeneracionData[] = [];
      let bestGlobalFitness = 0;
      let stagnationCount = 0;

      // Loop generations
      for (let g = 1; g <= maxGeneraciones; g++) {
        // Sort by fitness
        population.sort((a, b) => b.fitness - a.fitness);
        const bestGenFitness = population[0].fitness;
        
        if (bestGenFitness > bestGlobalFitness) {
          bestGlobalFitness = bestGenFitness;
          stagnationCount = 0;
        } else {
          stagnationCount++;
        }

        // Elitismo: carry top 3
        const nextPopulation: CromosomaInfo[] = population.slice(0, 3).map((ind, index) => ({
          ...ind,
          id: index
        }));

        let lastOp: OperacionDetalle | undefined;

        // Reproduce
        while (nextPopulation.length < poblacionSize) {
          // Selection (Tournament of 3)
          const tournamentSelect = () => {
            const candidates = Array.from({ length: 3 }, () => population[Math.floor(Math.random() * population.length)]);
            candidates.sort((a, b) => b.fitness - a.fitness);
            return candidates[0];
          };

          const p1 = tournamentSelect();
          const p2 = tournamentSelect();
          let childGenes = [...p1.cromosoma];

          // Crossover
          let cruceOcurred = false;
          if (Math.random() < cruceProb) {
            cruceOcurred = true;
            // Simplified BCRC crossover:
            // Extract route 0 from parent 1, remove those clients from parent 2, reinsert in best cost position
            const r1 = splitRoutes(p1.cromosoma, numVehicles)[0] || [];
            if (r1.length > 0) {
              const cleanParent2 = p2.cromosoma.filter(g => g <= 0 || !r1.includes(g));
              // Insert clients of r1 back
              r1.forEach(client => {
                // Find best insertion point in cleanParent2
                let bestIdx = 0;
                let bestCost = Infinity;
                
                for (let idx = 0; idx <= cleanParent2.length; idx++) {
                  const testChrom = [...cleanParent2.slice(0, idx), client, ...cleanParent2.slice(idx)];
                  const cost = 1 / evaluateMockChromosome(testChrom).fitness;
                  if (cost < bestCost) {
                    bestCost = cost;
                    bestIdx = idx;
                  }
                }
                cleanParent2.splice(bestIdx, 0, client);
              });
              childGenes = cleanParent2;
            }
          }

          // Mutation
          let mutOcurred = false;
          let mutType: 'mutacion_swap' | 'mutacion_or_opt' = 'mutacion_swap';
          let affectedGenes: number[] = [];

          if (Math.random() < mutacionProb) {
            mutOcurred = true;
            if (Math.random() < 0.5) {
              // Swap
              mutType = 'mutacion_swap';
              const idx1 = Math.floor(Math.random() * childGenes.length);
              const idx2 = Math.floor(Math.random() * childGenes.length);
              [childGenes[idx1], childGenes[idx2]] = [childGenes[idx2], childGenes[idx1]];
              affectedGenes = [idx1, idx2];
            } else {
              // Simple Or-opt: relocate 1 gene
              mutType = 'mutacion_or_opt';
              const idx = Math.floor(Math.random() * childGenes.length);
              const [removed] = childGenes.splice(idx, 1);
              const newIdx = Math.floor(Math.random() * childGenes.length);
              childGenes.splice(newIdx, 0, removed);
              affectedGenes = [idx, newIdx];
            }
          }

          // Local Search (2-opt with 10% prob)
          let twoOptOcurred = false;
          if (Math.random() < 0.10) {
            twoOptOcurred = true;
            // 2-opt on route 0 (reverse a subsegment)
            const routes = splitRoutes(childGenes, numVehicles);
            const r0 = routes[0];
            if (r0 && r0.length >= 4) {
              const i = Math.floor(Math.random() * (r0.length - 2));
              const j = i + 2 + Math.floor(Math.random() * (r0.length - i - 2));
              routes[0] = [...r0.slice(0, i), ...r0.slice(i, j + 1).reverse(), ...r0.slice(j + 1)];
              
              // rebuild child genes
              const rebuilt: number[] = [];
              routes.forEach((r, idx) => {
                rebuilt.push(...r);
                if (idx < numVehicles - 1) rebuilt.push(-idx);
              });
              childGenes = rebuilt;
            }
          }

          const childEval = evaluateMockChromosome(childGenes);
          const childId = nextPopulation.length;

          // Record last operation details for the generation step
          if (nextPopulation.length === 3) {
            let desc = 'Elitismo: Se preservan los mejores del lote anterior.';
            let type: OperacionDetalle['tipo'] = 'evaluacion_fitness';
            if (twoOptOcurred) {
              desc = 'Búsqueda Local 2-opt: Se pulieron rutas para eliminar cruces zig-zag.';
              type = 'local_search_2opt';
            } else if (mutOcurred) {
              desc = `Mutación ${mutType === 'mutacion_swap' ? 'Swap' : 'Or-opt'}: Se modificó aleatoriamente el orden de visita.`;
              type = mutType;
            } else if (cruceOcurred) {
              desc = 'Crossover BCRC: Se fusionaron las mejores rutas de los padres para crear al hijo.';
              type = 'crossover_bcrc';
            }
            
            lastOp = {
              tipo: type,
              padre1_id: p1.id,
              padre2_id: p2.id,
              hijo_id: childId,
              genes_afectados: affectedGenes,
              descripcion: desc
            };
          }

          nextPopulation.push({
            id: childId,
            cromosoma: childGenes,
            rutas: splitRoutes(childGenes, numVehicles),
            ...childEval
          });
        }

        generationsHistory.push({
          generacion: g,
          mejor_fitness_gen: bestGenFitness,
          mejor_fitness_global: bestGlobalFitness,
          contador_estancamiento: stagnationCount,
          poblacion_snapshot: population.slice(0, 10).map((ind, index) => ({ ...ind, id: index })), // keep top 10 for visualization grid
          operacion_ultima: lastOp || {
            tipo: 'evaluacion_fitness',
            descripcion: `Generación ${g} evaluada con éxito.`
          }
        });

        population = nextPopulation;
      }

      // 3. Final Result
      const bestFinal = population.sort((a, b) => b.fitness - a.fitness)[0];
      const finalRoutesDetails: Record<string, any> = {};
      const routesSplit = splitRoutes(bestFinal.cromosoma, numVehicles);

      routesSplit.forEach((route, k) => {
        const vehicle = vehiculos[k];
        const routeClients = route.map(idx => clientes[idx]);
        let dist = 0;
        let timeAcc = 0;
        let lastNode = clientes[0];
        
        routeClients.forEach(c => {
          dist += getDist(lastNode, c);
          timeAcc += getDist(lastNode, c) * 1.5 + c.tiempo_servicio;
          if (timeAcc >= 240 && timeAcc <= 360) timeAcc += 60;
          lastNode = c;
        });
        dist += getDist(lastNode, clientes[0]);
        timeAcc += getDist(lastNode, clientes[0]) * 1.5;

        finalRoutesDetails[vehicle.id] = {
          secuencia_visitas: routeClients.map(c => c.id),
          distancia_estimada_km: Math.round(dist * 10) / 10,
          tiempo_estimado_minutos: Math.round(timeAcc * 10) / 10,
          volumen_total: Math.round(routeClients.reduce((sum, c) => sum + c.volumen, 0) * 10) / 10,
          utilization_pct: Math.round((routeClients.reduce((sum, c) => sum + c.volumen, 0) / vehicle.capacidad_volumen) * 1000) / 10
        };
      });

      const finalResult: ResultadoFinal = {
        generacion_final: maxGeneraciones,
        tiempo_segundos_ejecucion: 1.25,
        mejor_fitness: bestFinal.fitness,
        cromosoma_optimo: bestFinal.cromosoma,
        historial_fitness: generationsHistory.map(g => g.mejor_fitness_global),
        rutas_vehiculos: finalRoutesDetails
      };

      set({
        generaciones: generationsHistory,
        resultadoFinal: finalResult,
        isGenerating: false,
        currentGenerationIdx: 0,
        currentStation: 1 // Jump to Station 1 after generation completes
      });
    }
  };
});
