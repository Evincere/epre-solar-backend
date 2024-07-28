import axios from 'axios';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SolarCalculationDto } from './dto/solar-calculation.dto';
import { HttpService } from '@nestjs/axios';
import { CalculadoraService } from 'src/calculadora/calculadora.service';
import { SolarData } from 'src/interfaces/solar-data/solar-data.interface';
import { TarifaCategoria } from 'src/tarifa-categoria/tarifa-categoria-enum';
import { PanelConfig } from 'src/interfaces/panel-config/panel-config.interface';

@Injectable()
export class SolarService {
  constructor(
    private readonly calculadoraService: CalculadoraService,
  ) {}

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
    solarCalculationDto: SolarCalculationDto,
  ): Promise<any> {
    const { latitude, longitude } = this.calculateCentroid(
      solarCalculationDto.coordenadas,
    );

    const solarDataApi = await this.getSolarData(latitude, longitude);
    const solarPanelConfig: PanelConfig = this.calculatePanelConfig(
      solarCalculationDto.annualConsumption,
      solarDataApi.solarPotential,
    );
    const solarData: SolarData = {
      annualConsumption: solarCalculationDto.annualConsumption,
      yearlyEnergyDcKwh: solarPanelConfig.yearlyEnergyDcKwh,
      panels: {
        panelsCount: solarPanelConfig.panelsCount,
        panelCapacityW: solarDataApi.solarPotential.panelCapacityWatts,
        panelSize: {
          height: solarDataApi.solarPotential.panelHeightMeters,
          width: solarDataApi.solarPotential.panelWidthMeters,
        },
      },
      carbonOffsetFactorKgPerMWh:
        solarDataApi.solarPotential.carbonOffsetFactorKgPerMwh,
      tarifaCategory: solarCalculationDto.categoriaSeleccionada,
    };

    return await this.calculadoraService.calculateEnergySavings(
      solarData,
    );
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

  private calculatePanelConfig(annualConsumption, solarPotential): PanelConfig {
    const configs = solarPotential.solarPanelConfigs;
    // Encuentra el índice del primer elemento que cumple con la condición
    const index = configs.findIndex(
      (element: PanelConfig) => element.yearlyEnergyDcKwh > annualConsumption,
    );
    // Si no se encuentra ningún elemento que cumpla con la condición, devuelve null
    if (index === -1) {
      return configs[configs.length - 1];
    }
    // Si el índice es 0, no hay un elemento anterior
    if (index === 0) {
      return configs[0];
    }
    // Devuelve el elemento inmediato anterior al que cumple con la condición
    return configs[index - 1];
  }
}
