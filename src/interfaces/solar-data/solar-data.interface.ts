import { TarifaCategoria } from "src/tarifa-categoria/tarifa-categoria-enum"

export interface SolarData {
    annualConsumption: number,
    yearlyEnergyAcKwh: number,
    panels: {
        panelsCountApi: number,
        maxPanelsPerSuperface: number,
        panelCapacityW: number,
        panelSize: {
            height: number,
            width: number
        },
        
    }
    carbonOffsetFactorKgPerMWh: number,
    tarifaCategory: TarifaCategoria,
}
