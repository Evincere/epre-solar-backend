import { FlujoIngresosMonetarios } from 'src/interfaces/flujo-ingresos-monetarios/flujo-ingresos-monetarios.interface';
import { FlujoEnergia } from '../datos-tecnicos/flujo-energia/flujo-energia';
import { ProyeccionTarifas } from 'src/interfaces/proyeccion-tarifas/proyeccion-tarifas.interface';
import { IflujoEnergia } from 'src/interfaces/iflujo-energia/iflujo-energia.interface';
import { SolarCalculationDto } from 'src/solar/dto/solar-calculation.dto';
import { SolarData } from 'src/interfaces/solar-data/solar-data.interface';
import { Tarifa } from 'src/tarifa-categoria/tarifa/tarifa';
import { CostoMantenimiento } from 'src/interfaces/costo-mantenimiento/costo-mantenimiento.interface';

export class EcoFin {
  private tipoDeCambioArs: number;
  private impuestosProvincialesYTasasMunicipales: number;
  private costoUsdWpSinIVA: number;
  private costoEquipoMedicionUsd: number;
  private inversionUsd: number;
  private costoMantenimientoUsd: number;
  private actualYear: number = new Date().getFullYear();
  private dto: SolarCalculationDto;
  private solarData: SolarData;

  constructor(
    dto: SolarCalculationDto,
    solarData: SolarData,
    tarifaCategory: Tarifa,
  ) {
    this.dto = dto;
    this.solarData = solarData;
    this.tipoDeCambioArs = dto.parametros.economicas.tipoCambioArs;
    this.impuestosProvincialesYTasasMunicipales = tarifaCategory.impuestos;
    this.costoUsdWpSinIVA = dto.parametros.inversionCostos.costoUsdWpAplicado;
    this.costoEquipoMedicionUsd =
      dto.parametros.inversionCostos.equipoDeMedicionUsdAplicado;
    this.calculateInversionInicial(solarData);
    this.costoMantenimientoUsd =
      dto.parametros.inversionCostos.costoDeMantenimientoInicialUsd;
  }

  calculateInversionInicial(solarData: SolarData) {
    this.dto.parametros.inversionCostos.inversion = (
      this.costoUsdWpSinIVA *
      (solarData.panels.panelCapacityW * solarData.panels.panelsCountApi +
        solarData.carbonOffsetFactorKgPerMWh / 1000)
    )
  }

  getFlujoIngresosMonetarios(
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
        periodoVeinteanalFlujoEnergia[0].energiaInyectadaKwhAnio *
        cargoVariableInyeccionUsd,
    });

    // Generación de los siguientes 19 años
    for (let i = 1; i < 20; i++) {
      const previousYearAutoconsumida =
        periodoVeinteanalFlujoEnergia[i].energiaAutoconsumidaKwhAnio;
      const previousYearInyectada =
        periodoVeinteanalFlujoEnergia[i].energiaInyectadaKwhAnio;

      periodoVeinteanal.push({
        year: periodoVeinteanalFlujoEnergia[i].anio,
        ahorroEnElectricidadTotalUsd:
          previousYearAutoconsumida *
          cargoVariableConsumoUsd *
          (1 + this.impuestosProvincialesYTasasMunicipales),
        ingresoPorInyeccionElectricaUsd:
          previousYearInyectada * cargoVariableInyeccionUsd,
      });
    }

    return periodoVeinteanal;
  }

  getProyeccionDeTarifas(tarifaCategory: Tarifa): ProyeccionTarifas[] {
    const periodoVeinteanal: ProyeccionTarifas[] = [];

    periodoVeinteanal.push({
      year: this.actualYear,
      cargoVariableConsumoUsdKwh:
        tarifaCategory.tarifaConsumoEnergiaArs / this.tipoDeCambioArs,
      cargoVariableInyeccionUsdKwh:
        tarifaCategory.tarifaInyeccionEnergiaArs / this.tipoDeCambioArs,
      tasaAnualAumentoDeTarifas:
        this.dto.parametros.economicas.tasaInflacionUsd,
    });

    for (let i = 1; i < 20; i++) {
      const previousProyeccion = periodoVeinteanal[i - 1];
      periodoVeinteanal.push({
        year: previousProyeccion.year + 1,
        cargoVariableConsumoUsdKwh:
          previousProyeccion.cargoVariableConsumoUsdKwh *
          (1 + this.dto.parametros.economicas.tasaInflacionUsd),
        cargoVariableInyeccionUsdKwh:
          previousProyeccion.cargoVariableInyeccionUsdKwh *
          (1 + this.dto.parametros.economicas.tasaInflacionUsd),
        tasaAnualAumentoDeTarifas:
          this.dto.parametros.economicas.tasaInflacionUsd,
      });
    }

    return periodoVeinteanal;
  }

  getCostoMantenimiento() {
    const periodoVeinteanal: CostoMantenimiento[] = [];

    periodoVeinteanal.push({
      year: this.actualYear,
      costoUsd: this.costoMantenimientoUsd,
    });

    for (let i = 1; i < 20; i++) {
      const previousCosto = periodoVeinteanal[i - 1];
      periodoVeinteanal.push({
        year: previousCosto.year + 1,
        costoUsd:
          previousCosto.costoUsd *
          (1 + this.dto.parametros.economicas.tasaInflacionUsd),
      });
    }

    return periodoVeinteanal;
  }
}
