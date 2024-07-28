import { FlujoEnergia } from 'src/calculadora/datos-tecnicos/flujo-energia/flujo-energia';
import { GeneracionFotovoltaica } from '../generacion-fotovoltaica/generacion-fotovoltaica.interface';
import { SolarData } from '../solar-data/solar-data.interface';
import { FlujoIngresosMonetarios } from '../flujo-ingresos-monetarios/flujo-ingresos-monetarios.interface';
import { EmisionesGeiEvitadas } from '../emisiones-gei-evitadas/emisiones-gei-evitadas.interface';
import { Resultados } from 'src/calculadora/resultados/resultados';

export interface ResultadosDto {
  solarData: SolarData;
  periodoVeinteanalGeneracionFotovoltaica: GeneracionFotovoltaica[];
  periodoVeinteanalFlujoEnergia: FlujoEnergia[];
  periodoVeinteanalFlujoIngresosMonetarios: FlujoIngresosMonetarios[];
  periodoVeinteanalEmisionesGEIEvitadas: EmisionesGeiEvitadas[];
  resultados: Resultados;
}
