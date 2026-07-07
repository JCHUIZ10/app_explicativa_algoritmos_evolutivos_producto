import numpy as np
import time
import random
from typing import List, Dict, Tuple, Any
from app.core.models.domain import Cliente, Vehiculo

class CVRPTWGeneticOptimizer:
    def __init__(
        self,
        clientes: List[Cliente],
        vehiculos: List[Vehiculo],
        matriz_distancias: np.ndarray,
        matriz_tiempos: np.ndarray,
        num_individuos: int = 120,
        alpha: float = 150.0,
        beta: float = 75.0,
    ):
        """
        CVRPTW Genetic Optimizer con soporte para N vehículos heterogéneos y memetic search.
        
        Args:
            clientes: Lista de objetos Cliente de dominio (longitud N_clientes).
            vehiculos: Lista de objetos Vehiculo de dominio.
            matriz_distancias: Matriz cuadrada de distancias (N_clientes + 1 x N_clientes + 1).
            matriz_tiempos: Matriz cuadrada de tiempos (N_clientes + 1 x N_clientes + 1).
            num_individuos: Tamaño de la población.
            alpha: Peso de penalización por exceso de capacidad de carga.
            beta: Peso de penalización por exceso de tiempo de jornada.
        """
        self.clientes_originales = clientes
        self.n = len(clientes)
        
        self.vehiculos = vehiculos
        if not self.vehiculos:
            raise ValueError("No hay vehículos activos en la flota para optimizar rutas.")
            
        self.matriz_distancias = matriz_distancias
        self.matriz_tiempos = matriz_tiempos
        
        # Volumen de clientes ordenado por el índice interno (1..n)
        self.volumenes = np.array([c.volumen for c in clientes])
        
        self.num_individuos = num_individuos
        self.alpha = alpha
        self.beta = beta

    def generar_poblacion_inicial(self) -> List[List[int]]:
        """
        Inicialización Híbrida:
        - 20% Heurístico (basado en Clarke-Wright Savings y Nearest Neighbor)
        - 80% Aleatorio puro
        """
        poblacion_inicial = []
        num_heuristica = int(self.num_individuos * 0.20)
        
        # Obtener semillas heurísticas
        cw_base = self._run_clarke_wright()
        nn_base = self._generar_individuo_heuristico_nn()
        
        heuristica_pool = []
        if cw_base:
            heuristica_pool.append(cw_base)
        if nn_base:
            heuristica_pool.append(nn_base)
            
        # Generar pool heurístico aplicando pequeñas mutaciones para diversidad
        while len(poblacion_inicial) < num_heuristica:
            if not heuristica_pool:
                indiv = self._generar_individuo_aleatorio()
            else:
                base = random.choice(heuristica_pool)
                indiv = list(base)
                if len(indiv) >= 2:
                    idx1, idx2 = random.sample(range(len(indiv)), 2)
                    indiv[idx1], indiv[idx2] = indiv[idx2], indiv[idx1]
            poblacion_inicial.append(indiv)
            
        # Completar con aleatorios
        while len(poblacion_inicial) < self.num_individuos:
            poblacion_inicial.append(self._generar_individuo_aleatorio())
            
        return poblacion_inicial

    def _generar_individuo_aleatorio(self) -> List[int]:
        M = len(self.vehiculos)
        separadores = list(range(0, -(M - 1), -1)) if M >= 2 else []
        cromosoma = list(range(1, self.n + 1)) + separadores
        random.shuffle(cromosoma)
        return cromosoma

    def _generar_individuo_heuristico_nn(self) -> List[int]:
        no_visitados = list(range(1, self.n + 1))
        nodo_actual = 0
        ruta_ordenada = []
        
        while no_visitados:
            nodo_siguiente = min(
                no_visitados, key=lambda x: self.matriz_distancias[nodo_actual, x]
            )
            ruta_ordenada.append(nodo_siguiente)
            no_visitados.remove(nodo_siguiente)
            nodo_actual = nodo_siguiente
            
        # División en M rutas
        M = len(self.vehiculos)
        rutas = []
        step = max(1, len(ruta_ordenada) // M)
        for i in range(M):
            if i == M - 1:
                rutas.append(ruta_ordenada[i * step:])
            else:
                rutas.append(ruta_ordenada[i * step : (i + 1) * step])
                
        # Reconstruir cromosoma
        cromosoma = []
        for idx, r in enumerate(rutas):
            cromosoma.extend(r)
            if idx < M - 1:
                cromosoma.append(-idx)
        return cromosoma

    def _run_clarke_wright(self) -> List[int]:
        """Inicialización usando el Algoritmo de Ahorros de Clarke-Wright."""
        M = len(self.vehiculos)
        max_cap = max(v.capacidad_volumen for v in self.vehiculos)
        
        # Cada cliente en su propia ruta
        rutas = [[i] for i in range(1, self.n + 1)]
        
        # Calcular ahorros
        savings = []
        for i in range(1, self.n + 1):
            for j in range(i + 1, self.n + 1):
                s = self.matriz_distancias[0, i] + self.matriz_distancias[0, j] - self.matriz_distancias[i, j]
                savings.append((s, i, j))
        savings.sort(reverse=True, key=lambda x: x[0])
        
        # Fusionar rutas respetando el límite máximo de capacidad
        for s, i, j in savings:
            route_i = None
            route_j = None
            for r in rutas:
                if i in r:
                    route_i = r
                if j in r:
                    route_j = r
            if route_i and route_j and route_i != route_j:
                is_i_end = (route_i[-1] == i)
                is_j_start = (route_j[0] == j)
                is_i_start = (route_i[0] == i)
                is_j_end = (route_j[-1] == j)
                
                can_merge = False
                new_route = []
                if is_i_end and is_j_start:
                    new_route = route_i + route_j
                    can_merge = True
                elif is_j_end and is_i_start:
                    new_route = route_j + route_i
                    can_merge = True
                    
                if can_merge:
                    vol_total = sum(self.volumenes[c - 1] for c in new_route)
                    if vol_total <= max_cap:
                        rutas.remove(route_i)
                        rutas.remove(route_j)
                        rutas.append(new_route)
                        
        # Ajustar para tener exactamente M rutas
        while len(rutas) > M:
            # Combinar las dos rutas con menor volumen
            min_comb_vol = float('inf')
            best_pair = (0, 1)
            for idx1 in range(len(rutas)):
                for idx2 in range(idx1 + 1, len(rutas)):
                    vol1 = sum(self.volumenes[c - 1] for c in rutas[idx1])
                    vol2 = sum(self.volumenes[c - 1] for c in rutas[idx2])
                    if vol1 + vol2 < min_comb_vol:
                        min_comb_vol = vol1 + vol2
                        best_pair = (idx1, idx2)
            r1 = rutas[best_pair[0]]
            r2 = rutas[best_pair[1]]
            rutas.remove(r1)
            rutas.remove(r2)
            rutas.append(r1 + r2)
            
        while len(rutas) < M:
            rutas.append([])
            
        # Reconstruir cromosoma
        cromosoma = []
        for idx, r in enumerate(rutas):
            cromosoma.extend(r)
            if idx < M - 1:
                cromosoma.append(-idx)
        return cromosoma

    def _split_routes(self, individuo: List[int]) -> List[List[int]]:
        """Divide el cromosoma en sub-rutas según delimitadores (valores <= 0)."""
        routes = []
        current_route = []
        for gene in individuo:
            if gene <= 0:
                routes.append(current_route)
                current_route = []
            else:
                current_route.append(gene)
        routes.append(current_route)
        
        M = len(self.vehiculos)
        while len(routes) < M:
            routes.append([])
        return routes[:M]

    def _route_distance(self, route: List[int]) -> float:
        """Calcula la distancia de ida y vuelta al depósito para una ruta."""
        if not route:
            return 0.0
        dist = self.matriz_distancias[0, route[0]]
        for idx in range(len(route) - 1):
            dist += self.matriz_distancias[route[idx], route[idx+1]]
        dist += self.matriz_distancias[route[-1], 0]
        return dist

    def _get_service_time(self, volumen: float) -> float:
        """Tiempo de desembarque según volumen (regla de negocio)."""
        if volumen <= 5.0:
            return 10.0
        elif volumen <= 15.0:
            return 20.0
        else:
            return 35.0

    def evaluate_individual(self, individuo: List[int]) -> Tuple[float, float, float, float]:
        """Evalúa un individuo considerando ventanas de tiempo, almuerzo, y jornada laboral."""
        routes = self._split_routes(individuo)
        
        distancia_total = 0.0
        exceso_capacidad = 0.0
        exceso_tiempo = 0.0
        
        for k, route in enumerate(routes):
            if not route:
                continue
            
            cap_k = self.vehiculos[k].capacidad_volumen
            
            nodo_actual = 0
            tiempo_actual = 0.0
            volumen_actual = 0.0
            refrigerio_tomado = False
            
            for cliente in route:
                distancia_total += self.matriz_distancias[nodo_actual, cliente]
                tiempo_actual += self.matriz_tiempos[nodo_actual, cliente]
                volumen_actual += self.volumenes[cliente - 1]
                
                tiempo_servicio = self._get_service_time(self.volumenes[cliente - 1])
                tiempo_actual += tiempo_servicio
                
                # Inyección del refrigerio (almuerzo) de 60 minutos
                if 240.0 <= tiempo_actual <= 360.0 and not refrigerio_tomado:
                    tiempo_actual += 60.0
                    refrigerio_tomado = True
                    
                nodo_actual = cliente
                
            distancia_total += self.matriz_distancias[nodo_actual, 0]
            tiempo_actual += self.matriz_tiempos[nodo_actual, 0]
            
            # Penalidad de capacidad heterogénea
            if volumen_actual > cap_k:
                exceso_capacidad += (volumen_actual - cap_k)
                
            # Penalidad de jornada de 8 horas (480 minutos)
            if tiempo_actual > 480.0:
                exceso_tiempo += (tiempo_actual - 480.0)
                
        costo_total = (
            distancia_total
            + (self.alpha * exceso_capacidad)
            + (self.beta * exceso_tiempo)
        )
        fitness = 1.0 / costo_total if costo_total > 0 else 0.0
        
        return fitness, distancia_total, exceso_capacidad, exceso_tiempo

    def tournament_selection(
        self, poblacion: List[List[int]], puntajes_fitness: List[float], k: int = 3
    ) -> List[int]:
        indices_seleccionados = random.sample(range(len(poblacion)), k)
        mejor_indice = max(indices_seleccionados, key=lambda idx: puntajes_fitness[idx])
        return list(poblacion[mejor_indice])

    def best_cost_route_crossover(self, padre1: List[int], padre2: List[int]) -> List[int]:
        """Cruce por Ruta de Mejor Costo (Best Cost Route Crossover - BCRC)."""
        routes1 = self._split_routes(padre1)
        routes2 = self._split_routes(padre2)
        
        non_empty_routes1 = [r for r in routes1 if r]
        if not non_empty_routes1:
            return list(padre2)
            
        # Seleccionar ruta aleatoria del Padre 1
        R1_star = random.choice(non_empty_routes1)
        clients_to_insert = list(R1_star)
        
        # Eliminar clientes del Padre 2
        for r in routes2:
            for c in clients_to_insert:
                if c in r:
                    r.remove(c)
                    
        # Reinsertar clientes en la mejor posición de costo del Padre 2
        for c in clients_to_insert:
            best_cost = float('inf')
            best_k = 0
            best_i = 0
            
            for k in range(len(routes2)):
                cap_k = self.vehiculos[k].capacidad_volumen
                r = routes2[k]
                
                vol_before = sum(self.volumenes[node - 1] for node in r)
                viol_before = max(0.0, vol_before - cap_k)
                dist_before = self._route_distance(r)
                
                for i in range(len(r) + 1):
                    r_new = r[:i] + [c] + r[i:]
                    dist_after = self._route_distance(r_new)
                    
                    vol_after = vol_before + self.volumenes[c - 1]
                    viol_after = max(0.0, vol_after - cap_k)
                    
                    delta_dist = dist_after - dist_before
                    delta_viol = viol_after - viol_before
                    
                    # Costo local para BCRC
                    cost = delta_dist + self.alpha * delta_viol
                    
                    if cost < best_cost:
                        best_cost = cost
                        best_k = k
                        best_i = i
                        
            routes2[best_k].insert(best_i, c)
            
        # Reconstruir hijo
        child = []
        for idx, r in enumerate(routes2):
            child.extend(r)
            if idx < len(routes2) - 1:
                child.append(-idx)
        return child

    def mutar_individuo(self, individuo: List[int]) -> List[int]:
        """Aplica mutación híbrida (Swap u Or-opt)."""
        if random.random() < 0.5:
            # Swap Mutation
            idx1, idx2 = random.sample(range(len(individuo)), 2)
            individuo[idx1], individuo[idx2] = individuo[idx2], individuo[idx1]
            return individuo
        else:
            # Or-opt Mutation (relocalizar un bloque de 1 a 3 clientes)
            routes = self._split_routes(individuo)
            non_empty = [r for r in routes if r]
            if not non_empty:
                return individuo
            route_src = random.choice(non_empty)
            
            block_size = min(len(route_src), random.choice([1, 2, 3]))
            start_idx = random.randint(0, len(route_src) - block_size)
            block = route_src[start_idx : start_idx + block_size]
            
            del route_src[start_idx : start_idx + block_size]
            
            route_dst = random.choice(routes)
            insert_idx = random.randint(0, len(route_dst))
            route_dst[insert_idx:insert_idx] = block
            
            child = []
            for idx, r in enumerate(routes):
                child.extend(r)
                if idx < len(routes) - 1:
                    child.append(-idx)
            return child

    def _2opt_route(self, route: List[int]) -> List[int]:
        """Optimización local 2-opt para eliminar cruces en una ruta."""
        improved = True
        best_route = list(route)
        best_dist = self._route_distance(best_route)
        
        for _ in range(5):  # Límite de iteraciones para mayor velocidad
            if not improved:
                break
            improved = False
            for i in range(len(best_route) - 1):
                for j in range(i + 1, len(best_route)):
                    new_route = best_route[:i] + best_route[i:j+1][::-1] + best_route[j+1:]
                    new_dist = self._route_distance(new_route)
                    if new_dist < best_dist - 1e-6:
                        best_route = new_route
                        best_dist = new_dist
                        improved = True
        return best_route

    def _optimize_individual_local_search(self, individuo: List[int]) -> List[int]:
        """Ejecuta búsqueda local (2-opt) a nivel de rutas."""
        routes = self._split_routes(individuo)
        for k in range(len(routes)):
            routes[k] = self._2opt_route(routes[k])
            
        child = []
        for idx, r in enumerate(routes):
            child.extend(r)
            if idx < len(routes) - 1:
                child.append(-idx)
        return child

    def obtener_detalle_rutas(self, individuo: List[int]) -> Dict[str, Any]:
        """Mapea el cromosoma final a las hojas de ruta y calcula cronómetros exactos."""
        routes = self._split_routes(individuo)
        detalle = {}
        
        for k, route in enumerate(routes):
            vehiculo = self.vehiculos[k]
            if not route:
                detalle[vehiculo.id] = {
                    "secuencia_visitas": [],
                    "distancia_estimada_km": 0.0,
                    "tiempo_estimado_minutos": 0.0,
                }
                continue
                
            distancia_vehiculo = 0.0
            tiempo_vehiculo = 0.0
            nodo_actual = 0
            refrigerio_tomado = False
            secuencia = []
            
            for cliente in route:
                cliente_orig = self.clientes_originales[cliente - 1]
                secuencia.append(cliente_orig.id)
                
                distancia_vehiculo += self.matriz_distancias[nodo_actual, cliente]
                tiempo_vehiculo += self.matriz_tiempos[nodo_actual, cliente]
                
                tiempo_servicio = self._get_service_time(self.volumenes[cliente - 1])
                tiempo_vehiculo += tiempo_servicio
                
                if 240.0 <= tiempo_vehiculo <= 360.0 and not refrigerio_tomado:
                    tiempo_vehiculo += 60.0
                    refrigerio_tomado = True
                    
                nodo_actual = cliente
                
            distancia_vehiculo += self.matriz_distancias[nodo_actual, 0]
            tiempo_vehiculo += self.matriz_tiempos[nodo_actual, 0]
            
            detalle[vehiculo.id] = {
                "secuencia_visitas": secuencia,
                "distancia_estimada_km": round(distancia_vehiculo, 2),
                "tiempo_estimado_minutos": round(tiempo_vehiculo, 2),
            }
            
        return detalle

    def ejecutar(
        self,
        max_generaciones: int = 500,
        limite_estancamiento: int = 80,
        limite_tiempo_segs: float = 120.0,
    ) -> Dict[str, Any]:
        """Ejecuta el Algoritmo Genético Híbrido (Memético)."""
        tiempo_inicio_real = time.time()
        poblacion = self.generar_poblacion_inicial()
        
        # Búsqueda local inicial para elevar la calidad base
        poblacion = [self._optimize_individual_local_search(ind) for ind in poblacion]
        
        mejor_individuo = None
        mejor_fitness = -1.0
        
        contador_estancamiento = 0
        historial_fitness = []
        
        for generacion in range(max_generaciones):
            metricas = [self.evaluate_individual(ind) for ind in poblacion]
            puntajes_fitness = [m[0] for m in metricas]
            
            # Buscar el mejor de la generación
            mejor_idx_gen = np.argmax(puntajes_fitness)
            mejor_fit_gen = puntajes_fitness[mejor_idx_gen]
            
            if mejor_fit_gen > mejor_fitness:
                mejor_fitness = mejor_fit_gen
                mejor_individuo = list(poblacion[mejor_idx_gen])
                contador_estancamiento = 0
            else:
                contador_estancamiento += 1
                
            historial_fitness.append(float(mejor_fitness))
            
            # Condiciones de parada acelerada
            tiempo_transcurrido = time.time() - tiempo_inicio_real
            if contador_estancamiento >= limite_estancamiento:
                break
            if tiempo_transcurrido >= limite_tiempo_segs:
                break
                
            # Elitismo: Preservar las top 3 mejores soluciones
            sorted_indices = np.argsort(puntajes_fitness)[::-1]
            siguiente_poblacion = [list(poblacion[idx]) for idx in sorted_indices[:3]]
            
            # Operaciones evolutivas para llenar población
            while len(siguiente_poblacion) < self.num_individuos:
                padre1 = self.tournament_selection(poblacion, puntajes_fitness)
                padre2 = self.tournament_selection(poblacion, puntajes_fitness)
                
                # Crossover (BCRC con 85% de probabilidad)
                if random.random() < 0.85:
                    hijo = self.best_cost_route_crossover(padre1, padre2)
                else:
                    hijo = list(padre1)
                    
                # Mutación (híbrida con 15% de probabilidad)
                if random.random() < 0.15:
                    hijo = self.mutar_individuo(hijo)
                    
                # Búsqueda local con probabilidad pequeña (10%) para acelerar convergencia
                if random.random() < 0.10:
                    hijo = self._optimize_individual_local_search(hijo)
                    
                siguiente_poblacion.append(hijo)
                
            poblacion = siguiente_poblacion
            
        # Pulir el mejor individuo al final con Local Search
        mejor_individuo = self._optimize_individual_local_search(mejor_individuo)
        mejor_fitness, _, _, _ = self.evaluate_individual(mejor_individuo)
        
        tiempo_fin = time.time() - tiempo_inicio_real
        rutas_detalle = self.obtener_detalle_rutas(mejor_individuo)
        
        return {
            "generacion_final": generacion + 1,
            "tiempo_segundos_ejecucion": float(tiempo_fin),
            "mejor_fitness": float(mejor_fitness),
            "cromosoma": mejor_individuo,
            "historial_fitness": historial_fitness,
            "rutas_vehiculos": rutas_detalle,
        }
