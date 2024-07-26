import { FlujoIngresosMonetarios } from 'src/interfaces/flujo-ingresos-monetarios/flujo-ingresos-monetarios.interface';
import { FlujoEnergia } from '../datos-tecnicos/flujo-energia/flujo-energia';

export class EcoFin {
  private readonly tipoDeCambioArs = 900;
  private readonly valorArsW = 120;
  private readonly valorMaximoPermitidoArs = 8500000;
  private readonly valorEstimadoInstalacionArs = 120000;
  private readonly valorEfectivoArs = 120000;
  private readonly impuestosProvincialesYTasasMunicipales = 0.2;
  private readonly costoUsdWpSinIVA = 1.5;
  private readonly costoEquipoMedicionUsd = 500;
  public static readonly costoInversionUsd = 3500;
  public static readonly costoMantenimientoUsd = 15;

  constructor() {}

  public getFlujoIngresosMonetarios(
    periodoVeinteanalFlujoEnergia: FlujoEnergia[],
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
      year: periodoVeinteanalFlujoEnergia[0].getYear(),
      ahorroEnElectricidadTotalUsd:
      periodoVeinteanalFlujoEnergia[0].getAutoconsumida() *
        cargoVariableConsumoUsd *
        (1 + this.impuestosProvincialesYTasasMunicipales),
      ingresoPorInyeccionElectricaUsd:
      periodoVeinteanalFlujoEnergia[0].getInyectada() * cargoVariableInyeccionUsd,
    });

    // Generación de los siguientes 19 años
    for (let i = 1; i < 20; i++) {
      const previousYearAutoconsumida = periodoVeinteanalFlujoEnergia[i].getAutoconsumida();
      const previousYearInyectada = periodoVeinteanalFlujoEnergia[i].getInyectada();

      periodoVeinteanal.push({
        year: periodoVeinteanalFlujoEnergia[i].getYear(),
        ahorroEnElectricidadTotalUsd:
          previousYearAutoconsumida *
          cargoVariableConsumoUsd *
          (1 + this.impuestosProvincialesYTasasMunicipales),
        ingresoPorInyeccionElectricaUsd: previousYearInyectada * cargoVariableInyeccionUsd,
      });
    }

    return periodoVeinteanal;
  }
}
