import { FlujoIngresosMonetarios } from 'src/interfaces/flujo-ingresos-monetarios/flujo-ingresos-monetarios.interface';
import { FlujoEnergia } from '../datos-tecnicos/flujo-energia/flujo-energia';
import { ProyeccionTarifas } from 'src/interfaces/proyeccion-tarifas/proyeccion-tarifas.interface';
import { IflujoEnergia } from 'src/interfaces/iflujo-energia/iflujo-energia.interface';

export class EcoFin {
  
  private readonly tipoDeCambioArs = 946.5;
  private readonly valorArsW = 120;
  private readonly valorMaximoPermitidoArs = 8500000;
  private readonly valorEstimadoInstalacionArs = 120000;
  private readonly valorEfectivoArs = 120000;
  private readonly impuestosProvincialesYTasasMunicipales = 0.2;
  private readonly costoUsdWpSinIVA = 1.5;
  private readonly costoEquipoMedicionUsd = 500;
  public static readonly costoInversionUsd = 3500;
  public static readonly costoMantenimientoUsd = 15;
  private readonly actualYear: number = new Date().getFullYear();

  constructor() {}

  public getFlujoIngresosMonetarios(
    periodoVeinteanalFlujoEnergia: IflujoEnergia[],
    tarifaConsumoEnergiaArs: number,
    tarifaInyeccionEnergiaArs: number,
  ): FlujoIngresosMonetarios[] {
    const periodoVeinteanal: FlujoIngresosMonetarios[] = [];
    const cargoVariableConsumoUsd: number =
      tarifaConsumoEnergiaArs / this.tipoDeCambioArs;
    const cargoVariableInyeccionUsd: number =
      tarifaInyeccionEnergiaArs / this.tipoDeCambioArs;
    // Generación del primer año
    periodoVeinteanal.push({
      year: periodoVeinteanalFlujoEnergia[0].anio,
      ahorroEnElectricidadTotalUsd:
      periodoVeinteanalFlujoEnergia[0].energiaAutoconsumidaKwhAnio *
        cargoVariableConsumoUsd *
        (1 + this.impuestosProvincialesYTasasMunicipales),
      ingresoPorInyeccionElectricaUsd:
      periodoVeinteanalFlujoEnergia[0].energiaInyectadaKwhAnio * cargoVariableInyeccionUsd,
    });

    // Generación de los siguientes 19 años
    for (let i = 1; i < 20; i++) {
      const previousYearAutoconsumida = periodoVeinteanalFlujoEnergia[i].energiaAutoconsumidaKwhAnio;
      const previousYearInyectada = periodoVeinteanalFlujoEnergia[i].energiaInyectadaKwhAnio;

      periodoVeinteanal.push({
        year: periodoVeinteanalFlujoEnergia[i].anio,
        ahorroEnElectricidadTotalUsd:
          previousYearAutoconsumida *
          cargoVariableConsumoUsd *
          (1 + this.impuestosProvincialesYTasasMunicipales),
        ingresoPorInyeccionElectricaUsd: previousYearInyectada * cargoVariableInyeccionUsd,
      });
    }

    return periodoVeinteanal;
  }

  getProyeccionDeTarifas(tarifaConsumoEnergiaArs: number, tarifaInyeccionEnergiaArs: number): ProyeccionTarifas[] {
    const periodoVeinteanal: ProyeccionTarifas[] = [];
    
    periodoVeinteanal.push({
      year: this.actualYear,
      cargoVariableConsumoUsdKwh: tarifaConsumoEnergiaArs/this.tipoDeCambioArs,
      cargoVariableInyeccionUsdKwh: tarifaInyeccionEnergiaArs/this.tipoDeCambioArs,
      tasaAnualAumentoDeTarifas: 0
    })

    for (let i = 1; i < 20; i++) {
      const previousProyeccion = periodoVeinteanal[i - 1];
      periodoVeinteanal.push({
        year: previousProyeccion.year + 1,
        cargoVariableConsumoUsdKwh: previousProyeccion.cargoVariableConsumoUsdKwh *(1 + 0.05),
        cargoVariableInyeccionUsdKwh: previousProyeccion.cargoVariableInyeccionUsdKwh * (1 + 0.05),
        tasaAnualAumentoDeTarifas: 0.05
      })
    }

    return periodoVeinteanal;
  }

  
}
