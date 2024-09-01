import axios from 'axios';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SolarCalculationDto } from './dto/solar-calculation.dto';
import { CalculadoraService } from 'src/calculadora/calculadora.service';
import { SolarData } from 'src/interfaces/solar-data/solar-data.interface';
import { PanelConfig } from 'src/interfaces/panel-config/panel-config.interface';
import { ResultadosDto } from 'src/interfaces/resultados-dto/resultados-dto.interface';

@Injectable()
export class SolarService {
  constructor(private readonly calculadoraService: CalculadoraService) {}

  async getSolarData(latitude: number, longitude: number): Promise<any> {
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new HttpException(
        'Invalid coordinates received',
        HttpStatus.BAD_REQUEST,
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${latitude}&location.longitude=${longitude}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new HttpException(
          'Location out of coverage',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        console.error('Error fetching data from API:', error.message);
        throw new HttpException(
          `An error occurred while fetching data: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async calculateSolarSavings(
    dto: SolarCalculationDto,
  ): Promise<any> {
    // console.log(dto);

    const { latitude, longitude } = this.calculateCentroid(
      dto.polygonCoordinates,
    );

    const solarDataApi = await this.getSolarData(latitude, longitude);

    const solarPanelConfig: PanelConfig = this.calculatePanelConfig(
      solarDataApi.solarPotential,
      dto.panelsSupported,
    );

    const solarData: SolarData = {
      annualConsumption: dto.annualConsumption,
      yearlyEnergyAcKwh: solarPanelConfig.yearlyEnergyDcKwh * dto.parametros?.caracteristicasSistema?.eficienciaInstalacion ?? 0.85,
      panels: {
        panelsCountApi: solarPanelConfig.panelsCount,
        maxPanelsPerSuperface: dto.panelsSupported,
        panelCapacityW: solarDataApi.solarPotential.panelCapacityWatts,
        panelSize: {
          height: solarDataApi.solarPotential.panelHeightMeters,
          width: solarDataApi.solarPotential.panelWidthMeters,
        },
      },
      carbonOffsetFactorKgPerMWh:
        solarDataApi.solarPotential.carbonOffsetFactorKgPerMwh,
      tarifaCategory: dto.categoriaSeleccionada,
    };

    return await this.calculadoraService.calculateEnergySavings(solarData, dto);
  }

  // Método para calcular el centroide de una superficie
  private calculateCentroid(coordenadas: any[]): {
    latitude: number;
    longitude: number;
  } {
    let sumLat = 0;
    let sumLng = 0;

    for (const coord of coordenadas) {
      const lat = parseFloat(coord.lat);
      const lng = parseFloat(coord.lng);

      if (!isNaN(lat) && !isNaN(lng)) {
        sumLat += lat;
        sumLng += lng;
      } else {
        console.error(
          `Invalid coordinate found: ${coord.latitude}, ${coord.longitude}`,
        );
      }
    }

    const centroidLat = sumLat / coordenadas.length;
    const centroidLng = sumLng / coordenadas.length;

    return { latitude: centroidLat, longitude: centroidLng };
  }

  private calculatePanelConfig(
    solarPotential: { solarPanelConfigs: any },
    panelsSupported: number,
  ): PanelConfig {
    if (panelsSupported < 4) {
      panelsSupported = 4;
    }
    const configs = solarPotential.solarPanelConfigs;
    const index = configs.findIndex(
      (element: PanelConfig) => element.panelsCount === panelsSupported,
    );
    // Si no se encuentra ningún elemento que cumpla con la condición, devuelve null
    if (index === -1) {
      return configs[configs.length - 1];
    }

    if (index === 0) {
      return configs[0];
    }

    return configs[index];
  }

  async calculateSolarSavingsNearby(
    solarDataNearby: SolarData,
  ): Promise<ResultadosDto> {
    const {
      yearlyEnergyAcKwh,
      panels: { panelsCountApi, maxPanelsPerSuperface },
    } = solarDataNearby;
    // Calcular la proporción entre maxPanelsPerSuperface y panelsCountApi
    const proportion = maxPanelsPerSuperface / panelsCountApi;

    // Ajustar el valor de yearlyEnergyAcKwh en función de la proporción
    const adjustedYearlyEnergyAcKwh = yearlyEnergyAcKwh * proportion;

    // Crear un nuevo objeto SolarData con el valor ajustado
    const adjustedSolarDataNearby = {
      ...solarDataNearby,
      yearlyEnergyAcKwh: adjustedYearlyEnergyAcKwh,
    };

    // Llamar al servicio con los datos ajustados
    return await this.calculadoraService.calculateEnergySavings(
      adjustedSolarDataNearby,
    );
  }
}
