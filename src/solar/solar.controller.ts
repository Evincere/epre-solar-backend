import {
  Body,
  Controller,
  Get,
  Options,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { SolarService } from './solar.service';
import { SolarCalculationDto } from './dto/solar-calculation.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResultadosDto } from 'src/interfaces/resultados-dto/resultados-dto.interface';
import { SolarData } from 'src/interfaces/solar-data/solar-data.interface';
import { CheckInitService } from 'src/google-sheets/check-init/check-init.service';
import { GoogleSheetsService } from 'src/google-sheets/google-sheets.service';
import { Response } from 'express';

@ApiTags('solar')
@Controller('solar')
export class SolarController {
  constructor(
    private readonly solarService: SolarService,
    private readonly sheetsService: GoogleSheetsService,
  ) {}

  @Post('calculate')
  @ApiOperation({
    summary: 'Realiza los cálculos para determinar el ahorro energético',
  })
  async calculateSolarSavings(
    @Body() solarCalculationDto: SolarCalculationDto,
    @Res() res: Response, 
  ): Promise<void> {
    
    try {
      const isOnline = await this.sheetsService.isCalculadoraOnline();

      if (isOnline) {
        const solarCalculationWithParameters: SolarCalculationDto =
          await this.sheetsService.addParametersToSolarCalculationDto(
            solarCalculationDto,
          );
          console.log("solarCalculationWithParameters ", solarCalculationWithParameters.parametros.cuadroTarifarioActual);
          
        const resultados = await this.solarService.calculateSolarSavings(
          solarCalculationWithParameters,
        );
        
        res.status(200).json(resultados); // Enviar resultados con código 200
      } else {
        this.handleOfflineCase(res);
      }
    } catch (error) {
      console.error('Error al calcular el ahorro solar:', error);
      res.status(500).json({
        mensaje: 'No se pudo calcular el ahorro solar.',
      }); // Enviar error con código 500
    }
  }

  private handleOfflineCase(res: Response): void {
    res.status(503).json({
      mensaje:
        'La calculadora no está disponible en este momento. Por favor, inténtelo más tarde.',
    }); // Enviar error con código 503
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
