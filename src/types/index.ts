export interface Cliente {
  id: string;
  nombre: string;
  volumen: number; // volumen del pedido en m3/kg
  lat: number;
  lng: number;
  tiempo_servicio: number; // tiempo de desembarque estimado en minutos
}

export interface Vehiculo {
  id: string;
  nombre: string;
  capacidad_volumen: number; // capacidad máxima
  tipo: string;
}

export interface RutaDetalle {
  secuencia_visitas: string[]; // ids de clientes
  distancia_estimada_km: number;
  tiempo_estimado_minutos: number;
  volumen_total?: number;
  utilization_pct?: number;
}

export interface CromosomaInfo {
  id: number;
  cromosoma: number[];
  fitness: number;
  distancia: number;
  exceso_capacidad: number;
  exceso_tiempo: number;
  rutas: number[][]; // rutas por índice (1-indexed clientes)
}

export interface OperacionDetalle {
  tipo: 'crossover_bcrc' | 'mutacion_swap' | 'mutacion_or_opt' | 'local_search_2opt' | 'torneo_seleccion' | 'evaluacion_fitness';
  padre1_id?: number;
  padre2_id?: number;
  hijo_id?: number;
  genes_afectados?: number[];
  descripcion: string;
  detalles?: any;
}

export interface GeneracionData {
  generacion: number;
  mejor_fitness_gen: number;
  mejor_fitness_global: number;
  contador_estancamiento: number;
  poblacion_snapshot: CromosomaInfo[];
  operacion_ultima?: OperacionDetalle;
}

export interface ResultadoFinal {
  generacion_final: number;
  tiempo_segundos_ejecucion: number;
  mejor_fitness: number;
  cromosoma_optimo: number[];
  historial_fitness: number[];
  rutas_vehiculos: Record<string, RutaDetalle>;
}
