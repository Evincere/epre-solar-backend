import { CuadroTarifario } from 'src/interfaces/sheets/cuadro-tarifario/cuadro-tarifario.interface';
import { TarifaCategoria } from '../tarifa-categoria-enum';
import { log } from 'console';

export class Tarifa {
  categoria: TarifaCategoria;
  potenciaMaximaContratadaKw?: number;
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
    potenciaMaximaContratadaKw: number,
    tarifarioActual?: CuadroTarifario[],
  ) {
    this.categoria = categoria;
    console.log(this.categoria);
    this.potenciaMaximaContratadaKw = potenciaMaximaContratadaKw ?? 0;

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
    console.log(tarifarioActual);

    if (tarifarioActual) {
      const cuadro = tarifarioActual.find((tarifa) => {
        return tarifa.nombre == this.categoria;
      });
      console.log(cuadro);

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

    console.log(cargosPorDefecto, this.categoria);
    return {
      consumo: cargosPorDefecto.consumo,
      inyeccion: cargosPorDefecto.inyeccion,
      impuestos: 0,
    };
  }

  private matchCategoriaConCuadro(
    nombreCuadro: string,
    categoria: TarifaCategoria,
  ): boolean {
    // Mapeo simple entre los nombres de CuadroTarifario y TarifaCategoria
    console.log('dentro del metodo de mapeo ', nombreCuadro, categoria);

    const map: { [key: string]: TarifaCategoria[] } = {
      'T1-R': [
        TarifaCategoria.T1_R1,
        TarifaCategoria.T1_R2,
        TarifaCategoria.T1_R3,
      ],
      'T1-G': [
        TarifaCategoria.T1_G1,
        TarifaCategoria.T1_G2,
        TarifaCategoria.T1_G3,
      ],
      'T2-SMP': [TarifaCategoria.T2_SMP],
      'T2-CMP': [TarifaCategoria.T2_CMP],
      'T3-BT': [TarifaCategoria.T3_BT],
      'T3-MT': [TarifaCategoria.T3_MT_13_2_KV, TarifaCategoria.T3_MT_33_KV],
      'TRA-SD': [TarifaCategoria.TRA_SD],
    };

    const result = map[nombreCuadro]?.includes(categoria);
    console.log(map[nombreCuadro])
    console.log(`Resultado de la comparación para ${nombreCuadro}: ${result}`);
    return result;
  }
}
