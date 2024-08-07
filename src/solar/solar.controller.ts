import { Body, Controller, Get, Options, Post, Query } from '@nestjs/common';
import { SolarService } from './solar.service';
import { SolarCalculationDto } from './dto/solar-calculation.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResultadosDto } from 'src/interfaces/resultados-dto/resultados-dto.interface';

@ApiTags('solar')
@Controller('solar')
export class SolarController {
  constructor(private readonly solarService: SolarService) {}

  @Post('calculate')
  @ApiOperation({
    summary: 'realiza los calculos para determinar el ahorro energético',
  })
  async calculateSolarSavings(
    @Body() solarCalculationDto: SolarCalculationDto,
  ): Promise<ResultadosDto> {
    return await this.solarService.calculateSolarSavings(solarCalculationDto);
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
