import { TarifaCategoria } from '../tarifa-categoria-enum';

export class Tarifa {
  categoria: TarifaCategoria;
  potenciaMaximaContratadaKw?: number;
  cargoVariableConsumoArs: number;
  cargoVariableInyeccionArs: number;

  private static readonly cargosPorCategoria: { [key in TarifaCategoria]: { consumo: number, inyeccion: number } } = {
    [TarifaCategoria.T1_G1]: { consumo: 77.51, inyeccion: 54.22 },
    [TarifaCategoria.T1_G2]: { consumo: 80.50, inyeccion: 55.00 },
    [TarifaCategoria.T1_G3]: { consumo: 85.75, inyeccion: 57.25 },
    [TarifaCategoria.T1_R1]: { consumo: 90.00, inyeccion: 60.00 },
    [TarifaCategoria.T1_R2]: { consumo: 95.00, inyeccion: 65.00 },
    [TarifaCategoria.T1_R3]: { consumo: 100.00, inyeccion: 70.00 },
    [TarifaCategoria.T2_CMP]: { consumo: 70.00, inyeccion: 50.00 },
    [TarifaCategoria.T2_SMP]: { consumo: 70.00, inyeccion: 50.00 },
    [TarifaCategoria.T3_BT]: { consumo: 70.00, inyeccion: 50.00 },
    [TarifaCategoria.T3_MT_13_2_KV]: { consumo: 70.00, inyeccion: 50.00 },
    [TarifaCategoria.T3_MT_33_KV]: { consumo: 70.00, inyeccion: 50.00 },
    [TarifaCategoria.TRA_SD]: { consumo: 70.00, inyeccion: 50.00 },
  };

  constructor(categoria: TarifaCategoria, potenciaMaximaContratadaKw?: number) {
    this.categoria = categoria;
    this.potenciaMaximaContratadaKw = potenciaMaximaContratadaKw;

    const cargos = Tarifa.cargosPorCategoria[categoria];
    this.cargoVariableConsumoArs = cargos.consumo;
    this.cargoVariableInyeccionArs = cargos.inyeccion;
  }
}
