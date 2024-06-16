import { ApiProperty } from "@nestjs/swagger";

// src/solar/dto/solar-calculation.dto.ts
export class SolarCalculationDto {
    @ApiProperty()
    monthlyAverageEnergyBill: number;
    @ApiProperty()
    energyCostPerKwh: number;
    @ApiProperty()
    panelsCount: number;
    @ApiProperty()
    panelCapacityWatts: number;
    @ApiProperty()
    installationCostPerWatt: number;
    @ApiProperty()
    solarIncentives: number;
  }
  