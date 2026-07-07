import { useAlgorithmStore } from './store/useAlgorithmStore';
import { GlobalLayout } from './components/GlobalLayout';
import { EStation1_Poblacion } from './components/estaciones/EStation1_Poblacion';
import { EStation2_Seleccion } from './components/estaciones/EStation2_Seleccion';
import { EStation3_Cruce } from './components/estaciones/EStation3_Cruce';
import { EStation4_Mutacion } from './components/estaciones/EStation4_Mutacion';
import { EStation5_LocalSearch } from './components/estaciones/EStation5_LocalSearch';

function App() {
  const currentStation = useAlgorithmStore((state) => state.currentStation);

  const renderStationContent = () => {
    switch (currentStation) {
      case 0:
        return <EStation1_Poblacion />;
      case 1:
        return <EStation2_Seleccion />;
      case 2:
        return <EStation3_Cruce />;
      case 3:
        return <EStation4_Mutacion />;
      case 4:
        return <EStation5_LocalSearch />;
      default:
        return <div style={{ color: 'var(--color-text-muted)' }}>Estación no válida.</div>;
    }
  };

  return (
    <GlobalLayout>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {renderStationContent()}
      </div>
    </GlobalLayout>
  );
}

export default App;
