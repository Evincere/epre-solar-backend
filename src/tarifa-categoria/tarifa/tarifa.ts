import { CuadroTarifario } from 'src/interfaces/sheets/cuadro-tarifario/cuadro-tarifario.interface';
import { TarifaCategoria } from '../tarifa-categoria-enum';

export class Tarifa {
  categoria: TarifaCategoria;
  potenciaMaximaContratadakW?: number;
  tarifaConsumoEnergiaArs: number;
  tarifaInyeccionEnergiaArs: number;
  impuestos: number;

  private static readonly cargosPorCategoria: {
    [key in TarifaCategoria]: { consumo: number; inyeccion: number };
  } = {
    [TarifaCategoria.T1_G1]: { consumo: 77.51, inyeccion: 54.22 },
    [TarifaCategoria.T1_G2]: { consumo: 80.5, inyeccion: 55.0 },
    [TarifaCategoria.T1_G3]: { consumo: 85.75, inyeccion: 57.25 },
    [TarifaCategoria.T1_R1]: { consumo: 90.0, inyeccion: 60.0 },
    [TarifaCategoria.T1_R2]: { consumo: 95.0, inyeccion: 65.0 },
    [TarifaCategoria.T1_R3]: { consumo: 100.0, inyeccion: 70.0 },
    [TarifaCategoria.T2_CMP]: { consumo: 70.0, inyeccion: 50.0 },
    [TarifaCategoria.T2_SMP]: { consumo: 70.0, inyeccion: 50.0 },
    [TarifaCategoria.T3_BT]: { consumo: 70.0, inyeccion: 50.0 },
    [TarifaCategoria.T3_MT_13_2_KV]: { consumo: 70.0, inyeccion: 50.0 },
    [TarifaCategoria.T3_MT_33_KV]: { consumo: 70.0, inyeccion: 50.0 },
    [TarifaCategoria.TRA_SD]: { consumo: 70.0, inyeccion: 50.0 },
  };

  constructor(
    categoria: TarifaCategoria,
    potenciaMaximaContratadakW: number,
    tarifarioActual?: CuadroTarifario[],
  ) {
    this.categoria = categoria;
    this.potenciaMaximaContratadakW = potenciaMaximaContratadakW ?? 0;

    const cargos = this.obtenerCargos(tarifarioActual);
    
    this.tarifaConsumoEnergiaArs = cargos.consumo;
    this.tarifaInyeccionEnergiaArs = cargos.inyeccion;
    this.impuestos = cargos.impuestos;
  }

  private obtenerCargos(tarifarioActual?: CuadroTarifario[]): {
    consumo: number;
    inyeccion: number;
    impuestos: number;
  } {

    if (tarifarioActual) {
      const cuadro = tarifarioActual.find((tarifa) => {
        return tarifa.nombre == this.categoria;
      });
      // console.log(cuadro);

      if (cuadro) {
        return {
          consumo: cuadro.cargoVariableConsumoArsKWh,
          inyeccion: cuadro.cargoVariableInyeccionArsKWh,
          impuestos: cuadro.impuestos,
        };
      }
    }

    // Manejar el caso en el que no se encuentra un cuadro
    console.warn(
      `No se encontró un cuadro tarifario para la categoría ${this.categoria}. Usando valores por defecto.`,
    );
    const cargosPorDefecto = Tarifa.cargosPorCategoria[this.categoria];

    if (!cargosPorDefecto) {
      throw new Error(
        `No se encontraron cargos por defecto para la categoría ${this.categoria}.`,
      );
    }

    return {
      consumo: cargosPorDefecto.consumo,
      inyeccion: cargosPorDefecto.inyeccion,
      impuestos: 0,
    };
  }

}
