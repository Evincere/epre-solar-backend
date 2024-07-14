import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SolarService } from './solar.service';
import { SolarCalculationDto } from './dto/solar-calculation.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CoordenadasDTO } from './dto/coordenadas.dto';

@ApiTags('solar')
@Controller('solar')
export class SolarController {
  constructor(private readonly solarService: SolarService) {}

  @Post('calcular')
  async calcularConGoogleApi(@Body() coordenadas: any[]): Promise<any> {
    // Calcula el centroide de la superficie para obtener una ubicación aproximada
    const centroid = this.calculateCentroid(coordenadas);
    // Obtener datos reales de la API solar de Google basados en el centroide
    const solarData = await this.solarService.getSolarData(centroid.latitude, centroid.longitude);
    
    /* const datosCalculados: SolarCalculationDto = {
      monthlyAverageEnergyBill: solarData.monthlyAverageEnergyBill || 150,
      energyCostPerKwh: solarData.energyCostPerKwh || 0.15,
      panelsCount: solarData.panelsCount || 20,
      panelCapacityWatts: solarData.panelCapacityWatts || 350,
      installationCostPerWatt: solarData.installationCostPerWatt || 3.5,
      solarIncentives: solarData.solarIncentives || 1000,
    }; */
    
    return solarData;
  }

  // Método para calcular el centroide de una superficie
  private calculateCentroid(coordenadas: any[]): { latitude: number; longitude: number } {
    let sumLat = 0;
    let sumLng = 0;

    for (const coord of coordenadas) {
      const lat = parseFloat(coord.lat);
      const lng = parseFloat(coord.lng);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        sumLat += lat;
        sumLng += lng;
      } else {
        console.error(`Invalid coordinate found: ${coord.latitude}, ${coord.longitude}`);
      }
    }

    const centroidLat = sumLat / coordenadas.length;
    const centroidLng = sumLng / coordenadas.length;
    
    return { latitude: centroidLat, longitude: centroidLng };
  }

  @Post('calculate')
  @ApiOperation({
    summary: 'realiza los calculos para determinar el ahorro energético',
  })
  async calculateSolarSavings(
    @Body() solarCalculationDto: SolarCalculationDto,
  ) {
    return this.solarService.calculateSolarSavings(solarCalculationDto);
  }
}
