import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SolarService } from './solar.service';
import { SolarCalculationDto } from './dto/solar-calculation.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CoordenadasDTO } from './dto/coordenadas.dto';

@ApiTags('solar')
@Controller('solar')
export class SolarController {
  constructor(private readonly solarService: SolarService) {}

  @Get('data')
  @ApiOperation({summary: 'obtiene los datos necesarios para el calculo'})
  async getSolarData(@Query() coordenadas: CoordenadasDTO) {
    return this.solarService.getSolarData(
      coordenadas.latitude,
      coordenadas.longitude,
    );
  }

  @Post('calculate')
  @ApiOperation({summary: 'realiza los calculos para determinar el ahorro energético'})
  async calculateSolarSavings(
    @Body() solarCalculationDto: SolarCalculationDto,
  ) {
    return this.solarService.calculateSolarSavings(solarCalculationDto);
  }
}
