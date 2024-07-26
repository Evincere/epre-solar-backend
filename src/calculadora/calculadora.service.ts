import { Injectable } from '@nestjs/common';
import { SolarData } from 'src/interfaces/solar-data/solar-data.interface';
import { Tarifa } from 'src/tarifa-categoria/tarifa/tarifa';
import { DatosTecnicos } from './datos-tecnicos/datos-tecnicos';
import { EcoFin } from './eco-fin/eco-fin';
import { Resultados } from './resultados/resultados';

@Injectable()
export class CalculadoraService {
  private datosTecnicos: DatosTecnicos;
  private ecoFin: EcoFin;
  private resultados: Resultados;
  constructor() {
    this.datosTecnicos = new DatosTecnicos();
    this.ecoFin = new EcoFin();
    
  }
  // Método principal para calcular el ahorro energético
  calculateEnergySavings(annualConsumption: number, solarData: SolarData): any {
    // Obtener datos del API de Solar
    const dcAcFactor: number = 0.85;
    const yearlyEnergyACKwh: number = solarData.yearlyEnergyDcKwh * dcAcFactor;
    const panelsCount: number = solarData.panels.panelsCount;
    const panelCapacityW: number = solarData.panels.panelCapacityW;
    const panelsSizeInstalationWp: number = panelsCount * panelCapacityW;
    const geiEmitionFactorTCo2Mwh: number =
      solarData.carbonOffsetFactorKgPerMWh / 1000;
    const tarifaCategory: Tarifa = new Tarifa(solarData.tarifaCategory);

    const periodoVeinteanalGeneracionFotovoltaica =
      this.datosTecnicos.getGeneracionFotovoltaica(annualConsumption, yearlyEnergyACKwh);

    const periodoVeinteanalFlujoEnergia = this.datosTecnicos.getFlujoEnergia(
      annualConsumption,
      yearlyEnergyACKwh,
      periodoVeinteanalGeneracionFotovoltaica
    );

    const periodoVeinteanalEmisionesGEIEvitadas =
      this.datosTecnicos.getEmisionesGEIEvitadas(
        periodoVeinteanalGeneracionFotovoltaica,
      );

    const periodoVeinteanalFlujoIngresosMonetarios =
      this.ecoFin.getFlujoIngresosMonetarios(
        periodoVeinteanalFlujoEnergia,
        tarifaCategory.cargoVariableConsumoArs,
        tarifaCategory.cargoVariableInyeccionArs,
      );

      this.resultados = new Resultados(periodoVeinteanalFlujoIngresosMonetarios, periodoVeinteanalEmisionesGEIEvitadas);

    return {
      periodoVeinteanalGeneracionFotovoltaica,
      periodoVeinteanalFlujoEnergia,
      periodoVeinteanalFlujoIngresosMonetarios,
      periodoVeinteanalEmisionesGEIEvitadas,
      resultados: this.resultados
    };
  }
}
