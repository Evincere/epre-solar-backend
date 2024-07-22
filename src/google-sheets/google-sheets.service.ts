import { Injectable, OnModuleInit } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';
import { IndicadorFinanciero } from 'src/interfaces/indicador-financiero/indicador-financiero.interface';
import { MesesConsumo } from 'src/interfaces/meses-consumo/meses-consumo.interface';

@Injectable()
export class GoogleSheetsService implements OnModuleInit {
  private serviceAccountKeyFile = './credentials.json';
  private googleSheetClient: sheets_v4.Sheets;

  constructor() {}

  async onModuleInit() {
    this.googleSheetClient = await this.getGoogleSheetClient();
  }

  async getGoogleSheetClient() {
    const auth = new google.auth.GoogleAuth({
      keyFile: this.serviceAccountKeyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    if (!(authClient instanceof google.auth.JWT)) {
      throw new Error('authClient must be an instance of google.auth.JWT');
    }
    return google.sheets({
      version: 'v4',
      auth: authClient,
    });
  }

  async cargarConsumosAnuales(meses: MesesConsumo[]) {
    const values = meses.map((mes) => [mes.consumo]);
    const range = 'Datos de entrada!B5:B16'; 
    const resource = {
      values,
    };

    try {
      const result = await this.googleSheetClient.spreadsheets.values.update({
        spreadsheetId: process.env.SPREADSHEET_CALCULADORA!,
        range,
        valueInputOption: 'RAW',
        requestBody: resource,
      });
      return result.data;
    } catch (error) {
      console.error('Error updating Google Sheets:', error);
      throw error;
    }
  }

  async cargarDatosSolarApi(solarData: any) {
    const solarPotential = solarData.solarPotential;
    const solarPanelConfig = solarPotential.solarPanelConfigs[0]; // todo: debe obtener la configuracion mas adecuada para cubrir el consumo del usuario
    await this.cargarYearlyEnergyDCkWh(solarPanelConfig.yearlyEnergyDcKwh);
    await this.cargarPanelsCount(solarPanelConfig.panelsCount);
  }

  async cargarPanelsCount(panelsCount: number) {
    const range = 'Datos de entrada!B22';
    const resource = {
      values: [[panelsCount]],
    };

    try {
      const result = await this.googleSheetClient.spreadsheets.values.update({
        spreadsheetId: process.env.SPREADSHEET_CALCULADORA,
        range,
        valueInputOption: 'RAW',
        requestBody: resource,
      });
      return result.data;
    } catch (error) {
      console.error('Error updating Google Sheets:', error);
      throw error;
    }
  }

  async cargarYearlyEnergyDCkWh(yearlyEnergyDcKwh: number) {
    let range = `Datos de entrada!B20`; 
    const resource = {
      values: [[yearlyEnergyDcKwh]],
    };

    try {
      const result = await this.googleSheetClient.spreadsheets.values.update({
        spreadsheetId: process.env.SPREADSHEET_CALCULADORA!,
        range,
        valueInputOption: 'RAW',
        requestBody: resource,
      });
      return result.data;
    } catch (error) {
      console.error('Error updating Google Sheets:', error);
      throw error;
    }
  }

  async readValueCalculadora(tabName: string, range: string) {
    return this.googleSheetClient.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_CALCULADORA!,
      range: `${tabName}!${range}`,
    });
  }

  async readResultados() {
    /* Obtener caso con capital propio */

    /* Obtener  los indicadores financieros*/
    const indicadoresFinancieros: IndicadorFinanciero =
      await this.getIndicadoresFinancieros();

    /* Obtener las emisiones GEI evitadas */
    const emisionesGEIEvitadas =
      await this.getEmisionesGEIEvitadas();
    console.log('Emisiones de GEI Evitadas:', emisionesGEIEvitadas);
    return indicadoresFinancieros;
  }

  private async getIndicadoresFinancieros(): Promise<IndicadorFinanciero> {
    const response = await this.readValueCalculadora('Resultados', 'A14:B16');
    const values = response.data.values;
    // Verifica que haya suficientes valores para llenar el objeto IndicadorFinanciero
    if (values.length < 3 || values[0].length < 2) {
      throw new Error(
        'No se encontraron datos suficientes para los indicadores financieros.',
      );
    }

    // Construye el objeto IndicadorFinanciero a partir de los valores
    const indicadorFinanciero: IndicadorFinanciero = {
      VAN$: parseFloat(values[0][1].replace('$', '').replace(',', '.')),
      'TIR%': parseFloat(values[1][1].replace('%', '').replace(',', '.')),
      payBackSimpleYears: parseFloat(values[2][1].replace(',', '.')),
    };

    return indicadorFinanciero;
  }

  private async getEmisionesGEIEvitadas() {
    const response = await this.readValueCalculadora('Resultados', 'B19:U20');
    const values = response.data.values;

    const years = values[0];
    const emissionsStrings = values[1];

    const emissionsNumbers = emissionsStrings.map(emission => parseFloat(emission));

    return {
      years,
      emissions: emissionsNumbers
    };
  }
}
