import axios from 'axios';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SolarCalculationDto } from './dto/solar-calculation.dto';

@Injectable()
export class SolarService {
  constructor(
  ) {}

  async getSolarData(latitude: number, longitude: number): Promise<any> {
    console.log({ receivedLatitude: latitude, receivedLongitude: longitude });
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new HttpException('Invalid coordinates received', HttpStatus.BAD_REQUEST);
    }
    
    const apiKey = process.env.GOOGLE_API_KEY;
    
    const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${latitude}&location.longitude=${longitude}&key=${apiKey}`;
    
    try {
      const response = await axios.get(url);
      console.log('Response Data:', response.data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new HttpException('Location out of coverage', HttpStatus.BAD_REQUEST);
      } else {
        console.error('Error fetching data from API:', error.message);
        throw new HttpException(
          `An error occurred while fetching data: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async calculateSolarSavings(dto: SolarCalculationDto): Promise<any> {
    const {
      monthlyAverageEnergyBill,
      energyCostPerKwh,
      panelsCount,
      panelCapacityWatts,
      installationCostPerWatt,
      solarIncentives,
    } = dto;

    const installationLifeSpan = 20;
    const dcToAcDerate = 0.85;
    const efficiencyDepreciationFactor = 0.995;
    const costIncreaseFactor = 1.022;
    const discountRate = 1.04;

    const installationSizeKw = (panelsCount * panelCapacityWatts) / 1000;
    const installationCostTotal =
      installationCostPerWatt * installationSizeKw * 1000;

    const monthlyKwhEnergyConsumption =
      monthlyAverageEnergyBill / energyCostPerKwh;
    const yearlyKwhEnergyConsumption = monthlyKwhEnergyConsumption * 12;

    const initialAcKwhPerYear = yearlyKwhEnergyConsumption * dcToAcDerate;
    const yearlyProductionAcKwh = Array.from(
      { length: installationLifeSpan },
      (_, year) => initialAcKwhPerYear * efficiencyDepreciationFactor ** year,
    );

    const yearlyUtilityBillEstimates = yearlyProductionAcKwh.map(
      (yearlyKwhEnergyProduced, year) => {
        const billEnergyKwh =
          yearlyKwhEnergyConsumption - yearlyKwhEnergyProduced;
        const billEstimate =
          (billEnergyKwh * energyCostPerKwh * costIncreaseFactor ** year) /
          discountRate ** year;
        return Math.max(billEstimate, 0);
      },
    );
    const remainingLifetimeUtilityBill = yearlyUtilityBillEstimates.reduce(
      (x, y) => x + y,
      0,
    );
    const totalCostWithSolar =
      installationCostTotal + remainingLifetimeUtilityBill - solarIncentives;

    const yearlyCostWithoutSolar = Array.from(
      { length: installationLifeSpan },
      (_, year) =>
        (monthlyAverageEnergyBill * 12 * costIncreaseFactor ** year) /
        discountRate ** year,
    );
    const totalCostWithoutSolar = yearlyCostWithoutSolar.reduce(
      (x, y) => x + y,
      0,
    );

    const savings = totalCostWithoutSolar - totalCostWithSolar;
/*     Escribir resultados en Google Sheets
 */
    /* await this.googleSheetsService.writeSheet(spreadsheetId, range, values);
    await this.googleSheetsService.writeGoogleSheet() */
    
   
    return {
      totalCostWithSolar,
      totalCostWithoutSolar,
      savings,
      breakEvenYear: this.calculateBreakEvenYear(
        totalCostWithSolar,
        yearlyUtilityBillEstimates,
        energyCostPerKwh,
      ),
    };
  }

  private calculateBreakEvenYear(
    totalCostWithSolar: number,
    yearlyUtilityBillEstimates: number[],
    energyCostPerKwh: number,
  ): number {
    let cumulativeSavings = 0;
    for (let year = 0; year < yearlyUtilityBillEstimates.length; year++) {
      cumulativeSavings += yearlyUtilityBillEstimates[year];
      if (cumulativeSavings >= totalCostWithSolar) {
        return year + 1;
      }
    }
    return -1;
  }
}
