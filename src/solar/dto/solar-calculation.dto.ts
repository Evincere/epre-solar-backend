import { ApiProperty } from "@nestjs/swagger";
import { CoordenadasDTO } from "./coordenadas.dto";
import { TarifaCategoria } from "src/tarifa-categoria/tarifa-categoria-enum";

// src/solar/dto/solar-calculation.dto.ts
export class SolarCalculationDto {
    @ApiProperty()
    annualConsumption: number;
    @ApiProperty()
    coordenadas: any[];
    @ApiProperty()
    categoriaSeleccionada: TarifaCategoria;
    @ApiProperty()
    selectedAreaM2: number;
  }
  