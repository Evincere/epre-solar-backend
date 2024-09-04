import { Body, Controller, Get, Options, Post, Query } from '@nestjs/common';
import { SolarService } from './solar.service';
import { SolarCalculationDto } from './dto/solar-calculation.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResultadosDto } from 'src/interfaces/resultados-dto/resultados-dto.interface';
import { SolarData } from 'src/interfaces/solar-data/solar-data.interface';
import { CheckInitService } from 'src/google-sheets/check-init/check-init.service';
import { GoogleSheetsService } from 'src/google-sheets/google-sheets.service';

@ApiTags('solar')
@Controller('solar')
export class SolarController {
  constructor(
    private readonly solarService: SolarService,
    private readonly sheetsService: GoogleSheetsService,
  ) { }

  @Post('calculate')
  @ApiOperation({
    summary: 'realiza los calculos para determinar el ahorro energético',
  })
  async calculateSolarSavings(
    @Body() solarCalculationDto: SolarCalculationDto,
  ): Promise<ResultadosDto> {
    try {
      const isOnline = await this.sheetsService.isCalculadoraOnline();

      if (isOnline) {
        const solarCalculationWithParameters =
          await this.sheetsService.addParametersToSolarCalculationDto(
            solarCalculationDto,
          );
        // console.log("calculos con parametros" + solarCalculationWithParameters)
        return await this.solarService.calculateSolarSavings(
          solarCalculationWithParameters,
        );
      } else {
        return await this.solarService.calculateSolarSavings(
          solarCalculationDto,
        );
      }
    } catch (error) {
      console.error('Error al calcular el ahorro solar:', error);
      throw new Error('No se pudo calcular el ahorro solar.');
    }
  }

  @Post('calculate-nearby')
  async calculateSolarSavingsNearby(
    @Body() solarDataNearby: SolarData,
  ): Promise<ResultadosDto> {
    return await this.solarService.calculateSolarSavingsNearby(solarDataNearby);
  }

  @Get('solarData')
  async getSolarData(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
  ) {
    return this.solarService.getSolarData(latitude, longitude);
  }

  @Options('calcular')
  handleOptions() {
    // Respuesta vacía para la solicitud OPTIONS
    return;
  }
}
