import { EmisionesGeiEvitadas } from 'src/interfaces/emisiones-gei-evitadas/emisiones-gei-evitadas.interface';
import { IndicadoresFinancieros } from 'src/interfaces/indicadores-financieros/indicadores-financieros.interface';
import { ResultadosCapitalPropio } from 'src/interfaces/resultados-capital-propio/resultados-capital-propio.interface';
import { EcoFin } from '../eco-fin/eco-fin';
import { FlujoIngresosMonetarios } from 'src/interfaces/flujo-ingresos-monetarios/flujo-ingresos-monetarios.interface';

export class Resultados {
  private readonly tasaDescuento = 10 / 100;
  private _casoConCapitalPropio: ResultadosCapitalPropio[];
  private _indicadoresFinancieros: IndicadoresFinancieros;
  private _emisionesGEIEvitadas: EmisionesGeiEvitadas[];

  constructor(
    periodoVeinteanalFlujoIngresosMonetarios: FlujoIngresosMonetarios[],
    periodoVeinteanalEmisionesGEIEvitadas: EmisionesGeiEvitadas[],
  ) {
    this.generarResultadosCapitalPropio(
      periodoVeinteanalFlujoIngresosMonetarios,
    );
    this.generarIndicadoresFinancieros();
    this.emisionesGEIEvitadas = periodoVeinteanalEmisionesGEIEvitadas;
  }

  private generarResultadosCapitalPropio(
    periodoVeinteanalFlujoIngresosMonetarios: FlujoIngresosMonetarios[],
  ): void {
    const periodoVeinteanal: ResultadosCapitalPropio[] = [];

    periodoVeinteanal.push({
      year: new Date().getFullYear(),
      flujoIngresos: 0,
      flujoEgresos: 0,
      inversiones: EcoFin.costoInversionUsd,
      flujoFondos:
        0 - 0 - EcoFin.costoInversionUsd,
      flujoAcumulado: 0 - 0 - EcoFin.costoInversionUsd,
    });

    for (let i = 1; i < 20; i++) {
      const year = periodoVeinteanalFlujoIngresosMonetarios[i - 1].year;
      const currentFlujoIngresos =
        periodoVeinteanalFlujoIngresosMonetarios[i - 1]
          .ahorroEnElectricidadTotalUsd +
        periodoVeinteanalFlujoIngresosMonetarios[i - 1].ingresoPorInyeccionElectricaUsd;
      const currentFlujoEgresos = EcoFin.costoMantenimientoUsd;
      const inversiones = 0;
      const currentFlujoFondos =
        currentFlujoIngresos - currentFlujoEgresos - inversiones;
      const currentFlujoAcumulado =
        periodoVeinteanal[i - 1].flujoAcumulado + currentFlujoFondos;

      periodoVeinteanal.push({
        year,
        flujoIngresos: currentFlujoIngresos,
        flujoEgresos: currentFlujoEgresos,
        inversiones,
        flujoFondos: currentFlujoFondos,
        flujoAcumulado: currentFlujoAcumulado,
      });
    }
    this.casoConCapitalPropio = periodoVeinteanal;
  }

  private generarIndicadoresFinancieros(): void {
    this.indicadoresFinancieros = {
      VAN$: this.calcularNPV(),
      'TIR%': this.calcularTIR(),
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
    this.casoConCapitalPropio.forEach((resultado, i) => {
      if (resultado.flujoAcumulado > 0) {
        return i + 1;
      }
    });
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
