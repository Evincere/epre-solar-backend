import { HttpService } from '@nestjs/axios';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SolarCalculationDto } from './dto/solar-calculation.dto';
import { GoogleSheetsService } from 'src/google-sheets/google-sheets.service';

@Injectable()
export class SolarService {
  constructor(
    private httpService: HttpService,
    private googleSheetsService: GoogleSheetsService,
  ) {}

  async getSolarData(latitude: number, longitude: number): Promise<any> {
    const apiKey = process.env.GOOGLE_API_KEY;
    const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${latitude}&location.longitude=${longitude}&key=${apiKey}`;

    try {
      const response = await lastValueFrom(
        this.httpService.get(url).pipe(
          catchError((error) => {
            throw new HttpException(
              `Failed to fetch data from Solar API: ${error.message}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `An error occurred while fetching data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
    // Escribir resultados en Google Sheets
    const spreadsheetId = '1w96gpl-m2RiV0vTKuCSCFAE5iEeoSHeRbJkTRzmLDZs';
    const range = 'Sheet1!A10';
    const values = [
      ['totalCostWithSolar', 'totalCostWithoutSolar', 'savings'],
      [totalCostWithSolar, totalCostWithoutSolar, savings],
    ];

    // await this.googleSheetsService.writeSheet(spreadsheetId, range, values);
    // await this.googleSheetsService.writeGoogleSheet()
    
   
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
