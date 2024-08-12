import { GeneracionFotovoltaica } from 'src/interfaces/generacion-fotovoltaica/generacion-fotovoltaica.interface';
import { FlujoEnergia } from './flujo-energia/flujo-energia';
import { EmisionesGeiEvitadas } from 'src/interfaces/emisiones-gei-evitadas/emisiones-gei-evitadas.interface';

export class DatosTecnicos {
  private readonly eficienciaInstalacion: number = 0.85;
  private readonly degradacionAnualPaneles: number = 0.004;
  private readonly factorEmisiontCO2perMWh: number = 0.397;
  private proporcionAutoconsumo: number = 0.8;
  private proporcionInyeccion: number = 1 - this.proporcionAutoconsumo;;
  private readonly actualYear: number = new Date().getFullYear();

  public getGeneracionFotovoltaica(
    yearlyEnergyACkWh: number,
  ): GeneracionFotovoltaica[] {
    const periodoVeinteanal: GeneracionFotovoltaica[] = [];
    
    // Generación del primer año
    periodoVeinteanal.push({
      anio: this.actualYear + 1,
      generacionFotovoltaicaKWh: yearlyEnergyACkWh,
    });

    // Generación de los siguientes 19 años con degradación anual
    for (let i = 1; i < 20; i++) {
      const previousYearGeneration =
        periodoVeinteanal[i - 1].generacionFotovoltaicaKWh;
      const degradedGeneration =
        previousYearGeneration * (1 - this.degradacionAnualPaneles);
      periodoVeinteanal.push({
        anio: periodoVeinteanal[i - 1].anio + 1,
        generacionFotovoltaicaKWh: degradedGeneration,
      });
    }
    
    return periodoVeinteanal;
  }

  public getFlujoEnergia(
    annualConsumption: number,
    yearlyEnergyACkWh: number,
    periodoVeinteanalGeneracionFotovoltaica: GeneracionFotovoltaica[]
  ): FlujoEnergia[] {
    const periodoVeinteanal: FlujoEnergia[] = [];
    // Generación del primer año
    periodoVeinteanal.push(
      new FlujoEnergia(
        periodoVeinteanalGeneracionFotovoltaica[0].anio,
        annualConsumption,
        periodoVeinteanalGeneracionFotovoltaica[0].generacionFotovoltaicaKWh,
        this.proporcionAutoconsumo,
        this.proporcionInyeccion
      ),
    );

    // Generación de los siguientes 19 años
    for (let i = 1; i < 20; i++) {
      const currentYear: number = periodoVeinteanalGeneracionFotovoltaica[i].anio

      periodoVeinteanal.push(
        new FlujoEnergia(
          currentYear,
          annualConsumption,
          periodoVeinteanalGeneracionFotovoltaica[i].generacionFotovoltaicaKWh,
          this.proporcionAutoconsumo,
          this.proporcionInyeccion,
        ),
      );
    }

    return periodoVeinteanal;
  }

  public getEmisionesGEIEvitadas(
    periodoVeinteanalGeneracionFotovoltaica: GeneracionFotovoltaica[],
  ): EmisionesGeiEvitadas[] {
    const periodoVeinteanal: EmisionesGeiEvitadas[] = [];
    // Generación del primer año
    periodoVeinteanal.push({
      year: periodoVeinteanalGeneracionFotovoltaica[0].anio,
      emisionesTonCO2:
        periodoVeinteanalGeneracionFotovoltaica[0].generacionFotovoltaicaKWh *
        (this.factorEmisiontCO2perMWh / 1000),
    });

    // Generación de los siguientes 19 años
    for (let i = 1; i < 20; i++) {
        const currentYearGeneration = periodoVeinteanalGeneracionFotovoltaica[i].generacionFotovoltaicaKWh;
        const emisionesTonCO2 = currentYearGeneration * (this.factorEmisiontCO2perMWh / 1000);
    
        periodoVeinteanal.push({
          year: periodoVeinteanalGeneracionFotovoltaica[i].anio,
          emisionesTonCO2,
        });
    }

    return periodoVeinteanal;
  }
}
