import { Injectable } from '@nestjs/common';
import { SolarData } from 'src/interfaces/solar-data/solar-data.interface';
import { Tarifa } from 'src/tarifa-categoria/tarifa/tarifa';
import { DatosTecnicos } from './datos-tecnicos/datos-tecnicos';
import { EcoFin } from './eco-fin/eco-fin';
import { Resultados } from './resultados/resultados';
import { SolarCalculationDto } from 'src/solar/dto/solar-calculation.dto';

@Injectable()
export class CalculadoraService {
  private datosTecnicos: DatosTecnicos;
  private ecoFin: EcoFin;
  private resultadosFinancieros: Resultados;
  constructor() {}
  // Método principal para calcular el ahorro energético
  calculateEnergySavings(solarData: SolarData, dto?: SolarCalculationDto): any {
    // Obtener datos del API de Solar
    const yearlyEnergyACKwh: number = solarData.yearlyEnergyAcKwh;
    const panelsCount: number = solarData.panels.panelsCountApi;
    const panelCapacityW: number = solarData.panels.panelCapacityW;
    const panelsSizeInstalationWp: number = panelsCount * panelCapacityW;
    const geiEmitionFactorTCo2Mwh: number =
      solarData.carbonOffsetFactorKgPerMWh / 1000;
    const tarifaCategory: Tarifa = new Tarifa(
      solarData.tarifaCategory,
      dto.potenciaMaxAsignada,
      dto.parametros?.cuadroTarifarioActual,
    );
    const annualConsumption = solarData.annualConsumption;

    this.datosTecnicos = new DatosTecnicos(dto, solarData);

    const periodoVeinteanalGeneracionFotovoltaica =
      this.datosTecnicos.getGeneracionFotovoltaica(yearlyEnergyACKwh);

    const periodoVeinteanalFlujoEnergia = this.datosTecnicos.getFlujoEnergia(
      annualConsumption,
      yearlyEnergyACKwh,
      periodoVeinteanalGeneracionFotovoltaica,
    );

    const periodoVeinteanalEmisionesGEIEvitadas =
      this.datosTecnicos.getEmisionesGEIEvitadas(
        periodoVeinteanalGeneracionFotovoltaica,
      );

    this.ecoFin = new EcoFin(dto, solarData, tarifaCategory);

    const periodoVeinteanalProyeccionTarifas =
      this.ecoFin.getProyeccionDeTarifas(tarifaCategory);

    const periodoVeinteanalFlujoIngresosMonetarios =
      this.ecoFin.getFlujoIngresosMonetarios(
        periodoVeinteanalFlujoEnergia,
        tarifaCategory.tarifaConsumoEnergiaArs,
        tarifaCategory.tarifaInyeccionEnergiaArs,
      );

    const periodoVeinteanalCostoMantenimiento =
      this.ecoFin.getCostoMantenimiento();

    this.resultadosFinancieros = new Resultados(
      periodoVeinteanalFlujoIngresosMonetarios,
      periodoVeinteanalEmisionesGEIEvitadas,
      periodoVeinteanalCostoMantenimiento,
      dto,
    );

    return {
      solarData,
      periodoVeinteanalGeneracionFotovoltaica,
      periodoVeinteanalFlujoEnergia,
      periodoVeinteanalFlujoIngresosMonetarios,
      periodoVeinteanalEmisionesGEIEvitadas,
      periodoVeinteanalProyeccionTarifas,
      resultadosFinancieros: {
        casoConCapitalPropio: this.resultadosFinancieros.casoConCapitalPropio,
        indicadoresFinancieros:
          this.resultadosFinancieros.indicadoresFinancieros,
      },
    };
  }
}
