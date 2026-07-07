import { create } from 'zustand';
import type { Cliente, Vehiculo, CromosomaInfo } from '../types';

interface AlgorithmState {
  // Config / Data
  clientes: Cliente[];
  vehiculos: Vehiculo[];
  currentStation: number; // 0 = Población Inicial, 1 = Selección, 2 = Cruce, 3 = Mutación, 4 = Búsqueda Local

  // --- Estación 0: Población Inicial (Nearest Neighbor Step-by-Step) ---
  nnActiveTab: 'interactive' | 'comparative';
  nnCurrentNodeId: string;
  nnVisitedIds: string[];
  nnRoutes: string[][];
  nnCurrentRoute: string[];
  nnCurrentVolume: number;
  nnStatus: 'idle' | 'building' | 'done';
  nnVehicleIdx: number;
  nnLog: string[];

  // --- Estación 1: Selección (Tournament Arena) ---
  tournamentCandidates: CromosomaInfo[];
  tournamentWinnerId: number | null;
  tournamentStatus: 'idle' | 'ready' | 'fighting' | 'done';

  // --- Estación 2: Cruce BCRC ---
  crossoverStep: number; // 0: intro, 1: select route to donate, 2: remove from parent 2, 3: reinsert one by one, 4: done
  crossoverP1: CromosomaInfo;
  crossoverP2: CromosomaInfo;
  crossoverDonatedRoute: number[];
  crossoverTempChrom: number[];
  crossoverChildChrom: number[];
  crossoverInsertionIndex: number; // current insertion client index
  crossoverLogs: string[];

  // --- Estación 3: Mutación ---
  mutationChrom: number[];
  mutationOriginalChrom: number[];
  mutationMode: 'swap' | 'or-opt';
  mutationSelectedIndices: number[];
  mutationHoverIndex: number | null;

  // --- Estación 4: Búsqueda Local (2-opt) ---
  twoOptRoute: string[]; // Node IDs in sequence
  twoOptOriginalRoute: string[];
  twoOptHasCrossing: boolean;

  // Actions
  setCurrentStation: (station: number) => void;

  // NN Actions
  nnReset: () => void;
  nnStep: () => void;
  nnRunAll: () => void;
  setNnActiveTab: (tab: 'interactive' | 'comparative') => void;

  // Tournament Actions
  tournamentReset: () => void;
  tournamentPrepare: () => void;
  tournamentFight: () => void;

  // Crossover Actions
  crossoverReset: () => void;
  crossoverStepNext: () => void;

  // Mutation Actions
  mutationReset: () => void;
  mutationSetMode: (mode: 'swap' | 'or-opt') => void;
  mutationClickGene: (index: number) => void;

  // 2-opt Actions
  twoOptReset: () => void;
  twoOptApply: () => void;
}

// Fixed mock clients with 2D grid coordinates (fit for SVG render)
const CLIENTES: Cliente[] = [
  { id: 'DEP', nombre: 'Depósito Central', volumen: 0, lat: 0, lng: 0, tiempo_servicio: 0 },
  { id: 'CLI-01', nombre: 'Tienda El Bosque', volumen: 4.0, lat: 15, lng: 25, tiempo_servicio: 10 },
  { id: 'CLI-02', nombre: 'Supermercado Norte', volumen: 8.5, lat: -25, lng: 35, tiempo_servicio: 20 },
  { id: 'CLI-03', nombre: 'Abarrotes Sur', volumen: 3.0, lat: 30, lng: -15, tiempo_servicio: 10 },
  { id: 'CLI-04', nombre: 'Distribuidora Este', volumen: 10.0, lat: -10, lng: -30, tiempo_servicio: 35 },
  { id: 'CLI-05', nombre: 'Minimarket Alameda', volumen: 5.5, lat: 10, lng: 45, tiempo_servicio: 20 },
  { id: 'CLI-06', nombre: 'Panadería Central', volumen: 2.0, lat: -35, lng: -10, tiempo_servicio: 10 },
  { id: 'CLI-07', nombre: 'Restaurante Portal', volumen: 9.0, lat: 20, lng: -35, tiempo_servicio: 20 },
  { id: 'CLI-08', nombre: 'Farmacia San Juan', volumen: 4.5, lat: -30, lng: 20, tiempo_servicio: 10 },
];

const VEHICULOS: Vehiculo[] = [
  { id: 'VEH-01', nombre: 'Camión Grande Alpha', capacidad_volumen: 22, tipo: 'Grande' },
  { id: 'VEH-02', nombre: 'Camión Mediano Beta', capacidad_volumen: 15, tipo: 'Mediano' },
  { id: 'VEH-03', nombre: 'Van de Reparto Gamma', capacidad_volumen: 10, tipo: 'Pequeño' },
];

// Mock Chromosomes for Tournament and Crossover examples
const MOCK_P1: CromosomaInfo = {
  id: 0,
  cromosoma: [1, 5, -0, 2, 8, -1, 3, 7, 4, 6],
  fitness: 0.0041,
  distancia: 243.5,
  exceso_capacidad: 0,
  exceso_tiempo: 0,
  rutas: [[1, 5], [2, 8], [3, 7, 4, 6]]
};

const MOCK_P2: CromosomaInfo = {
  id: 1,
  cromosoma: [2, 1, 5, -0, 8, 3, -1, 7, 4, 6],
  fitness: 0.0035,
  distancia: 285.7,
  exceso_capacidad: 2.5,
  exceso_tiempo: 0,
  rutas: [[2, 1, 5], [8, 3], [7, 4, 6]]
};

const MOCK_CHROMOSOMES: CromosomaInfo[] = [
  MOCK_P1,
  MOCK_P2,
  {
    id: 2,
    cromosoma: [3, 4, -0, 1, 2, -1, 5, 6, 7, 8],
    fitness: 0.0021,
    distancia: 476.2,
    exceso_capacidad: 5.0,
    exceso_tiempo: 45,
    rutas: [[3, 4], [1, 2], [5, 6, 7, 8]]
  },
  {
    id: 3,
    cromosoma: [8, 7, 6, -0, 5, 4, -1, 3, 2, 1],
    fitness: 0.0018,
    distancia: 550.4,
    exceso_capacidad: 12.0,
    exceso_tiempo: 95,
    rutas: [[8, 7, 6], [5, 4], [3, 2, 1]]
  }
];

export const useAlgorithmStore = create<AlgorithmState>((set, get) => {
  
  const getDistById = (id1: string, id2: string) => {
    const c1 = CLIENTES.find(c => c.id === id1)!;
    const c2 = CLIENTES.find(c => c.id === id2)!;
    return Math.sqrt(Math.pow(c1.lat - c2.lat, 2) + Math.pow(c1.lng - c2.lng, 2));
  };

  return {
    // Initial Setup
    clientes: CLIENTES,
    vehiculos: VEHICULOS,
    currentStation: 0,

    // --- Estación 0: Población Inicial State ---
    nnActiveTab: 'interactive',
    nnCurrentNodeId: 'DEP',
    nnVisitedIds: [],
    nnRoutes: [],
    nnCurrentRoute: [],
    nnCurrentVolume: 0,
    nnStatus: 'idle',
    nnVehicleIdx: 0,
    nnLog: ['Inicializado en el Depósito Central. Flota disponible lista.'],

    // --- Estación 1: Selección State ---
    tournamentCandidates: [],
    tournamentWinnerId: null,
    tournamentStatus: 'idle',

    // --- Estación 2: Cruce BCRC State ---
    crossoverStep: 0,
    crossoverP1: MOCK_P1,
    crossoverP2: MOCK_P2,
    crossoverDonatedRoute: [],
    crossoverTempChrom: [],
    crossoverChildChrom: [],
    crossoverInsertionIndex: 0,
    crossoverLogs: [],

    // --- Estación 3: Mutación State ---
    mutationChrom: [1, 2, 3, -0, 4, 5, -1, 6, 7, 8],
    mutationOriginalChrom: [1, 2, 3, -0, 4, 5, -1, 6, 7, 8],
    mutationMode: 'swap',
    mutationSelectedIndices: [],
    mutationHoverIndex: null,

    // --- Estación 4: Búsqueda Local State ---
    twoOptRoute: ['DEP', 'CLI-01', 'CLI-05', 'CLI-02', 'CLI-08', 'DEP'], // Visual crossing (1->5 cross 2->8)
    twoOptOriginalRoute: ['DEP', 'CLI-01', 'CLI-05', 'CLI-02', 'CLI-08', 'DEP'],
    twoOptHasCrossing: true,

    // Base Actions
    setCurrentStation: (station) => {
      set({ currentStation: station });
      // Reset station states on entry
      if (station === 0) get().nnReset();
      if (station === 1) get().tournamentReset();
      if (station === 2) get().crossoverReset();
      if (station === 3) get().mutationReset();
      if (station === 4) get().twoOptReset();
    },

    // --- NN Actions ---
    setNnActiveTab: (tab) => set({ nnActiveTab: tab }),
    nnReset: () => set({
      nnCurrentNodeId: 'DEP',
      nnVisitedIds: [],
      nnRoutes: [],
      nnCurrentRoute: [],
      nnCurrentVolume: 0,
      nnStatus: 'idle',
      nnVehicleIdx: 0,
      nnLog: ['Sistema reiniciado. Vehículos en depósito central.'],
    }),
    nnStep: () => {
      const { nnCurrentNodeId, nnVisitedIds, nnRoutes, nnCurrentRoute, nnCurrentVolume, nnVehicleIdx, nnStatus } = get();
      
      if (nnStatus === 'done') return;

      const unvisited = CLIENTES.filter(c => c.id !== 'DEP' && !nnVisitedIds.includes(c.id));
      
      // If all visited, close the last route and finish
      if (unvisited.length === 0) {
        if (nnCurrentRoute.length > 0) {
          const finalRoutes = [...nnRoutes, [...nnCurrentRoute]];
          set({
            nnRoutes: finalRoutes,
            nnCurrentRoute: [],
            nnCurrentNodeId: 'DEP',
            nnStatus: 'done',
            nnLog: [...get().nnLog, `Todos los clientes visitados. Ruta final finalizada. Retorno al depósito.`]
          });
        } else {
          set({ nnStatus: 'done' });
        }
        return;
      }

      // If we are at depot and starting a new route
      const activeVehicle = VEHICULOS[nnVehicleIdx] || VEHICULOS[VEHICULOS.length - 1];
      
      // Find nearest unvisited neighbor
      let nearest: Cliente | null = null;
      let minDist = Infinity;
      
      for (const c of unvisited) {
        const d = getDistById(nnCurrentNodeId, c.id);
        if (d < minDist) {
          minDist = d;
          nearest = c;
        }
      }

      if (!nearest) return;

      // Check capacity
      if (nnCurrentVolume + nearest.volumen <= activeVehicle.capacidad_volumen) {
        // Can add to current route
        set({
          nnCurrentNodeId: nearest.id,
          nnVisitedIds: [...nnVisitedIds, nearest.id],
          nnCurrentRoute: [...nnCurrentRoute, nearest.id],
          nnCurrentVolume: nnCurrentVolume + nearest.volumen,
          nnStatus: 'building',
          nnLog: [...get().nnLog, `Añadido ${nearest.nombre} (Demanda: ${nearest.volumen} m³, Distancia: ${minDist.toFixed(1)} km). Capacidad Camión: ${nnCurrentVolume + nearest.volumen}/${activeVehicle.capacidad_volumen} m³.`],
        });
      } else {
        // Exceeds capacity: close current route, return to depot, assign next vehicle
        const nextVehicleIdx = nnVehicleIdx + 1;
        const nextVehicle = VEHICULOS[nextVehicleIdx];
        
        const updatedRoutes = [...nnRoutes, [...nnCurrentRoute]];
        
        if (nextVehicle) {
          set({
            nnRoutes: updatedRoutes,
            nnCurrentRoute: [],
            nnCurrentVolume: 0,
            nnCurrentNodeId: 'DEP',
            nnVehicleIdx: nextVehicleIdx,
            nnLog: [...get().nnLog, `Capacidad excedida en ${activeVehicle.nombre}. Retorno al depósito. Asignado nuevo vehículo: ${nextVehicle.nombre} (Cap: ${nextVehicle.capacidad_volumen} m³).`],
          });
        } else {
          // No more vehicles but clients left! Override capacity warning.
          set({
            nnCurrentNodeId: nearest.id,
            nnVisitedIds: [...nnVisitedIds, nearest.id],
            nnCurrentRoute: [...nnCurrentRoute, nearest.id],
            nnCurrentVolume: nnCurrentVolume + nearest.volumen,
            nnLog: [...get().nnLog, `¡Sin vehículos adicionales! Sobrecargando ${activeVehicle.nombre}: Añadido ${nearest.nombre}.`],
          });
        }
      }
    },
    nnRunAll: () => {
      get().nnReset();
      let iterations = 0;
      // Loop until done, limit to 20 to avoid infinite loops
      while (get().nnStatus !== 'done' && iterations < 20) {
        get().nnStep();
        iterations++;
      }
    },

    // --- Tournament Actions ---
    tournamentReset: () => set({
      tournamentCandidates: [],
      tournamentWinnerId: null,
      tournamentStatus: 'idle',
    }),
    tournamentPrepare: () => {
      // Pick 3 random candidates from the pool
      const candidates = [...MOCK_CHROMOSOMES];
      // Shuffle candidates list to pick 3 random
      const shuffled = candidates.sort(() => 0.5 - Math.random()).slice(0, 3);
      set({
        tournamentCandidates: shuffled.map((c, idx) => ({ ...c, id: idx })), // assign local IDs
        tournamentWinnerId: null,
        tournamentStatus: 'ready'
      });
    },
    tournamentFight: () => {
      const { tournamentCandidates } = get();
      if (tournamentCandidates.length === 0) return;
      
      set({ tournamentStatus: 'fighting' });

      // After a small delay, resolve the winner (brute force max fitness)
      setTimeout(() => {
        const sorted = [...tournamentCandidates].sort((a, b) => b.fitness - a.fitness);
        const winner = sorted[0];
        set({
          tournamentWinnerId: winner.id,
          tournamentStatus: 'done'
        });
      }, 1500); // 1.5 seconds combat animation delay
    },

    // --- Crossover Actions ---
    crossoverReset: () => set({
      crossoverStep: 0,
      crossoverDonatedRoute: [],
      crossoverTempChrom: [],
      crossoverChildChrom: [],
      crossoverInsertionIndex: 0,
      crossoverLogs: ['Crossover inicializado. Selecciona la ruta para donar del Padre 1.'],
    }),
    crossoverStepNext: () => {
      const { crossoverStep, crossoverDonatedRoute } = get();
      
      if (crossoverStep === 0) {
        // Step 0 -> Step 1: Donate Route [1, 5] from Parent 1
        const donated = [1, 5];
        set({
          crossoverStep: 1,
          crossoverDonatedRoute: donated,
          crossoverLogs: [...get().crossoverLogs, `Ruta seleccionada del Padre 1 para donación: [${donated.join(' ➔ ')}].`]
        });
      } else if (crossoverStep === 1) {
        // Step 1 -> Step 2: Remove donated nodes from Parent 2
        // Parent 2 original: [2, 1, 5, -0, 8, 3, -1, 7, 4, 6]
        // Cleaned: [2, -0, 8, 3, -1, 7, 4, 6]
        const cleanParent2 = MOCK_P2.cromosoma.filter(g => g <= 0 || !crossoverDonatedRoute.includes(g));
        set({
          crossoverStep: 2,
          crossoverTempChrom: cleanParent2,
          crossoverLogs: [...get().crossoverLogs, `Clientes [${crossoverDonatedRoute.join(', ')}] removidos de Padre 2 para evitar duplicados. Cromosoma temporal: [${cleanParent2.join(', ')}].`]
        });
      } else if (crossoverStep === 2) {
        // Step 2 -> Step 3: Reinsert node 1 at best cost
        // Let's insert client 1 at best cost.
        // For CLI-01 (lat:15, lng:25), let's insert it in route 0: [2, 1, -0, 8, 3, -1, 7, 4, 6]
        const stage1Chrom = [2, 1, -0, 8, 3, -1, 7, 4, 6];
        set({
          crossoverStep: 3,
          crossoverTempChrom: stage1Chrom,
          crossoverLogs: [...get().crossoverLogs, `Cliente 1 reinsertado en la mejor posición de costo del Padre 2 (después de cliente 2). Costo delta mínimo calculado.`]
        });
      } else if (crossoverStep === 3) {
        // Step 3 -> Step 4: Reinsert node 5 at best cost
        // Insert client 5 in route 0: [2, 1, 5, -0, 8, 3, -1, 7, 4, 6]
        const finalChild = [2, 1, 5, -0, 8, 3, -1, 7, 4, 6];
        set({
          crossoverStep: 4,
          crossoverChildChrom: finalChild,
          crossoverLogs: [...get().crossoverLogs, `Cliente 5 reinsertado en el camión 1. Hijo completo reconstruido de forma óptima.`]
        });
      }
    },

    // --- Mutation Actions ---
    mutationReset: () => set({
      mutationChrom: [1, 2, 3, -0, 4, 5, -1, 6, 7, 8],
      mutationOriginalChrom: [1, 2, 3, -0, 4, 5, -1, 6, 7, 8],
      mutationMode: 'swap',
      mutationSelectedIndices: [],
      mutationHoverIndex: null,
    }),
    mutationSetMode: (mode) => set({
      mutationMode: mode,
      mutationSelectedIndices: [] // reset selections
    }),
    mutationClickGene: (index) => {
      const { mutationMode, mutationSelectedIndices, mutationChrom } = get();
      
      if (mutationMode === 'swap') {
        const selected = [...mutationSelectedIndices];
        
        if (selected.includes(index)) {
          // Deselect
          set({ mutationSelectedIndices: selected.filter(i => i !== index) });
        } else {
          selected.push(index);
          if (selected.length === 2) {
            // Perform Swap
            const updated = [...mutationChrom];
            const [i1, i2] = selected;
            const temp = updated[i1];
            updated[i1] = updated[i2];
            updated[i2] = temp;
            
            set({
              mutationChrom: updated,
              mutationSelectedIndices: [] // clear selection
            });
          } else {
            set({ mutationSelectedIndices: selected });
          }
        }
      } else {
        // Or-opt block move:
        // Let's implement block drag/shift simulation. Clicking a gene moves it 2 slots forward.
        const updated = [...mutationChrom];
        const val = updated[index];
        if (val <= 0) return; // don't shift separators in this mock

        updated.splice(index, 1);
        // Insert 2 slots forward
        const newIdx = (index + 2) % updated.length;
        updated.splice(newIdx, 0, val);
        
        set({
          mutationChrom: updated,
          mutationSelectedIndices: [newIdx] // briefly highlight new index
        });
        setTimeout(() => set({ mutationSelectedIndices: [] }), 800);
      }
    },

    // --- 2-opt Actions ---
    twoOptReset: () => set({
      twoOptRoute: ['DEP', 'CLI-01', 'CLI-05', 'CLI-02', 'CLI-08', 'DEP'],
      twoOptHasCrossing: true
    }),
    twoOptApply: () => {
      // 2-opt swaps CLI-05 and CLI-02 to CLI-02 and CLI-05
      // Route becomes: DEP -> CLI-01 -> CLI-02 -> CLI-05 -> CLI-08 -> DEP
      set({
        twoOptRoute: ['DEP', 'CLI-01', 'CLI-02', 'CLI-05', 'CLI-08', 'DEP'],
        twoOptHasCrossing: false
      });
    }
  };
});
