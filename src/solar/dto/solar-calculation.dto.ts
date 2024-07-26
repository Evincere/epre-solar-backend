import { ApiProperty } from "@nestjs/swagger";
import { CoordenadasDTO } from "./coordenadas.dto";

// src/solar/dto/solar-calculation.dto.ts
export class SolarCalculationDto {
    @ApiProperty()
    annualConsumption: number;
    @ApiProperty()
    coordenadas: CoordenadasDTO;
  }
  