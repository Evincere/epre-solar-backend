import { TarifaCategoria } from "src/tarifa-categoria/tarifa-categoria-enum"

export interface SolarData {
    yearlyEnergyDcKwh: number,
    panels: {
        panelsCount: number,
        panelCapacityW: number

    }
    carbonOffsetFactorKgPerMWh: number,
    tarifaCategory: TarifaCategoria,
}
