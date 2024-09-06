import { EmisionesGeiEvitadas } from 'src/interfaces/emisiones-gei-evitadas/emisiones-gei-evitadas.interface';
import { IndicadoresFinancieros } from 'src/interfaces/indicadores-financieros/indicadores-financieros.interface';
import { ResultadosCapitalPropio } from 'src/interfaces/resultados-capital-propio/resultados-capital-propio.interface';
import { EcoFin } from '../eco-fin/eco-fin';
import { FlujoIngresosMonetarios } from 'src/interfaces/flujo-ingresos-monetarios/flujo-ingresos-monetarios.interface';
import { SolarCalculationDto } from 'src/solar/dto/solar-calculation.dto';
import { CostoMantenimiento } from 'src/interfaces/costo-mantenimiento/costo-mantenimiento.interface';
import { SolarData } from 'src/interfaces/solar-data/solar-data.interface';

export class Resultados {
  private readonly tasaDescuento = 10 / 100;
  private _casoConCapitalPropio: ResultadosCapitalPropio[];
  private _indicadoresFinancieros: IndicadoresFinancieros;
  private _emisionesGEIEvitadas: EmisionesGeiEvitadas[];
  private dto: SolarCalculationDto;
  private solarData: SolarData;

  constructor(
    periodoVeinteanalFlujoIngresosMonetarios: FlujoIngresosMonetarios[],
    periodoVeinteanalEmisionesGEIEvitadas: EmisionesGeiEvitadas[],
    periodoVeinteanalCostoMantenimiento: CostoMantenimiento[],
    solarData: SolarData,
    dto?: SolarCalculationDto
  ) {
    this.solarData = solarData;
    this.dto = dto;
    
    this.generarResultadosCapitalPropio(
      periodoVeinteanalFlujoIngresosMonetarios,
      periodoVeinteanalCostoMantenimiento
    );
    this.generarIndicadoresFinancieros();
    this.emisionesGEIEvitadas = periodoVeinteanalEmisionesGEIEvitadas;
  }

  private generarResultadosCapitalPropio(
    periodoVeinteanalFlujoIngresosMonetarios: FlujoIngresosMonetarios[],
    periodoVeinteanalCostoMantenimiento: CostoMantenimiento[]
  ): void {
    const periodoVeinteanal: ResultadosCapitalPropio[] = [];
    const inversion = this.calculateInversion(this.dto, this.solarData);
    this.dto.parametros.inversionCostos.inversion = inversion;

    periodoVeinteanal.push({
      year: new Date().getFullYear(),
      flujoIngresos: 0,
      flujoEgresos: 0,
      inversiones: this.dto.parametros.inversionCostos.inversion,
      flujoFondos: 0 - 0 - this.dto.parametros.inversionCostos.inversion,
      flujoAcumulado: 0 - 0 - this.dto.parametros.inversionCostos.inversion,
    });

    for (let i = 1; i < 20; i++) {
      const year = periodoVeinteanal[i - 1].year + 1;

      const currentFlujoIngresos =
        periodoVeinteanalFlujoIngresosMonetarios[i - 1]
          .ahorroEnElectricidadTotalUsd +
        periodoVeinteanalFlujoIngresosMonetarios[i - 1]
          .ingresoPorInyeccionElectricaUsd;

      const currentFlujoEgresos =
      periodoVeinteanalCostoMantenimiento[i].costoUsd

      const currentFlujoFondos =
        currentFlujoIngresos - currentFlujoEgresos;
      const currentFlujoAcumulado =
        periodoVeinteanal[i - 1].flujoAcumulado + currentFlujoFondos;

      periodoVeinteanal.push({
        year,
        flujoIngresos: currentFlujoIngresos,
        flujoEgresos: currentFlujoEgresos,
        flujoFondos: currentFlujoFondos,
        inversiones: 0,
        flujoAcumulado: currentFlujoAcumulado,
      });
    }
    this.casoConCapitalPropio = periodoVeinteanal;
  }

  private calculateInversion(dto: SolarCalculationDto, solarData: SolarData): number {
    const maxPanelsPerSuperface = solarData.panels.maxPanelsPerSuperface;
    const panelsApi = solarData.panels.panelsCountApi;
    const panelsSelected = solarData.panels.panelsSelected ?? panelsApi;

    const costoUsdWp = dto.parametros.inversionCostos.costoUsdWpAplicado;
   
    const instalacionCapacityW = panelsSelected * solarData.panels.panelCapacityW;
    const costoEquipoMedicionUsd = dto.parametros.inversionCostos.equipoDeMedicionUsdAplicado;
    console.log(costoUsdWp, solarData.panels.panelCapacityW, panelsSelected, costoEquipoMedicionUsd);
    
    return (costoUsdWp * instalacionCapacityW) + costoEquipoMedicionUsd;
  }

  private generarIndicadoresFinancieros(): void {
    this.indicadoresFinancieros = {
      VAN: this.calcularNPV(),
      TIR: this.calcularTIR(),
      payBackSimpleYears: this.calcularPlazoRetorno(),
    };
  }

  private calcularNPV(): number {
    let npv = 0;
    for (let i = 0; i < this.casoConCapitalPropio.length; i++) {
      npv +=
        this.casoConCapitalPropio[i].flujoFondos /
        Math.pow(1 + this.tasaDescuento, i + 1);
    }
    return npv;
  }

  private calcularTIR(): number {
    const epsilon = 0.0001; // Precisión deseada
    let tasaMin = 0.0;
    let tasaMax = 1.0;
    let tir = (tasaMin + tasaMax) / 2;

    const npv = (tasa: number) => {
      let npvValue = 0;
      for (let i = 0; i < this.casoConCapitalPropio.length; i++) {
        npvValue +=
          this.casoConCapitalPropio[i].flujoFondos / Math.pow(1 + tasa, i + 1);
      }
      return npvValue;
    };

    while (tasaMax - tasaMin > epsilon) {
      tir = (tasaMin + tasaMax) / 2;
      const npvValue = npv(tir);

      if (npvValue > 0) {
        tasaMin = tir;
      } else {
        tasaMax = tir;
      }
    }

    return tir * 100;
  }

  private calcularPlazoRetorno(): number {
    for (let i = 0; i < this.casoConCapitalPropio.length; i++) {
      if (this.casoConCapitalPropio[i].flujoAcumulado > 0) {
        return i;
      }
    }
    return -1;
  }

  public get casoConCapitalPropio(): ResultadosCapitalPropio[] {
    return this._casoConCapitalPropio;
  }
  public set casoConCapitalPropio(value: ResultadosCapitalPropio[]) {
    this._casoConCapitalPropio = value;
  }

  public get indicadoresFinancieros(): IndicadoresFinancieros {
    return this._indicadoresFinancieros;
  }
  public set indicadoresFinancieros(value: IndicadoresFinancieros) {
    this._indicadoresFinancieros = value;
  }

  public get emisionesGEIEvitadas(): EmisionesGeiEvitadas[] {
    return this._emisionesGEIEvitadas;
  }
  public set emisionesGEIEvitadas(value: EmisionesGeiEvitadas[]) {
    this._emisionesGEIEvitadas = value;
  }
}
