import { TarifaCategoria } from "src/tarifa-categoria/tarifa-categoria-enum"

export interface SolarData {
    annualConsumption: number,
    yearlyEnergyDcKwh: number,
    panels: {
        panelsCount: number,
        panelCapacityW: number
        panelSize: {
            height: number,
            width: number
        }
    }
    carbonOffsetFactorKgPerMWh: number,
    tarifaCategory: TarifaCategoria,
}
