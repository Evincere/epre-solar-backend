import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sheets_v4 } from 'googleapis';
import { CaracteristicasSistema } from 'src/interfaces/sheets/caracteristicas-sistema/caracteristicas-sistema.interface';
import { Economicas } from 'src/interfaces/sheets/cotizacion/economicas.interface';
import { CuadroTarifario } from 'src/interfaces/sheets/cuadro-tarifario/cuadro-tarifario.interface';
import { InversionCostos } from 'src/interfaces/sheets/inversion-ycostos/inversion-costos.interface';
import { TasaDescuento } from 'src/interfaces/sheets/tasa-descuento/tasa-descuento.interface';

@Injectable()
export class VariablesOnlineService {

  private readonly spreadsheetId: string;
  private readonly rangeCaracteristicas: string;
  private readonly rangeEconomicas: string;
  private readonly rangeCostos: string;
  private readonly rangeCuadroTarifario: string;
  private readonly rangeTaxes: string;
  private readonly rangeInversion: string;

  constructor(private readonly configService: ConfigService) {
    this.spreadsheetId = this.configService.get<string>('GOOGLE_SHEET_ID');
    
    this.rangeCaracteristicas = this.configService.get<string>(
      'GOOGLE_SHEET_RANGE_CARACTERISTICAS',
    );
    this.rangeEconomicas = this.configService.get<string>(
      'GOOGLE_SHEET_RANGE_ECONOMICAS',
    );
    this.rangeCostos = this.configService.get<string>(
      'GOOGLE_SHEET_RANGE_COSTOS',
    );
    this.rangeInversion = this.configService.get<string>(
      'GOOGLE_SHEET_RANGE_INVERSION',
    );

    this.rangeCuadroTarifario = this.configService.get<string>(
      'GOOGLE_SHEET_RANGE_CUADRO_TARIFARIO',
    )

    this.rangeTaxes = this.configService.get<string>(
      'GOOGLE_SHEET_RANGE_TAXES'
    )

  }

  async getCuadroTarifario(googleSheetClient: sheets_v4.Sheets): Promise<CuadroTarifario[]> {
    try {
      const response = await googleSheetClient.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.rangeCuadroTarifario,
      });
      
      let taxesResponse = await googleSheetClient.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.rangeTaxes
      })

      const rows = response.data.values;
      const taxes = taxesResponse.data.values;

      if (!rows || rows.length === 0 || !taxes) {
        throw new Error('No se encontraron datos en el rango especificado.');
      }

      const cuadroTarifario: CuadroTarifario[] = rows.map((row, index) => {
        const taxRow = taxes[index]; 
        return {
          nombre: row[0] as CuadroTarifario['nombre'],
          cargoVariableConsumoArsKWh: this.parseFloatWithFormat(row[1]),
          cargoVariableInyeccionArsKWh: this.parseFloatWithFormat(row[2]),
          tension: row[3] as CuadroTarifario['tension'],
          impuestos: taxRow ? this.parseFloatWithFormat(taxRow[0]) / 100 : 0
        };
      });

      return cuadroTarifario;
    } catch (error) {
      throw new Error(
        'No se pudieron obtener los cuadros tarifarios.',
      );
    }
  }

  async getInversionYCostos(
    googleSheetClient: sheets_v4.Sheets,
  ): Promise<InversionCostos> {
    try {
      const response = await googleSheetClient.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.rangeCostos,
      });

      const responseInversion = await googleSheetClient.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.rangeInversion
      });

      const rows = response.data.values;
      const rowsInversion = responseInversion.data.values;

      if (!rows || rows.length === 0 || !rowsInversion) {
        throw new Error('No se encontraron datos en el rango especificado.');
      }

      const inversionYCostos: InversionCostos = {
        costoUsdWpConIva: this.parseFloatWithFormat(rows[0][1]),
        costoUsdWpAplicado: this.parseFloatWithFormat(rows[1][1]),
        equipoDeMedicionArsSinIva: this.parseFloatWithFormat(rows[2][1]),
        equipoDeMedicionUsdAplicado: this.parseFloatWithFormat(rows[3][1]),
        mantenimiento: this.parseFloatWithFormat(rows[4][1]),
        costoDeMantenimientoInicialUsd: this.parseFloatWithFormat(rows[5][1]),
        inversion: this.parseFloatWithFormat(rowsInversion[0][0])
      };

      return inversionYCostos;
    } catch (error) {
      throw new Error(
        'No se pudieron obtener las características del sistema.',
      );
    }
  }

  async getCaracteristicasSistema(
    googleSheetClient: sheets_v4.Sheets,
  ): Promise<CaracteristicasSistema> {
    try {
      const response = await googleSheetClient.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.rangeCaracteristicas,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        throw new Error('No se encontraron datos en el rango especificado.');
      }

      const caracteristicasSistema: CaracteristicasSistema = {
        eficienciaInstalacion: this.parseFloatWithFormat(rows[0][1]) / 100,
        degradacionAnualPanel: this.parseFloatWithFormat(rows[1][1]) / 100,
        proporcionAutoconsumo: this.parseFloatWithFormat(rows[2][1]) / 100,
        proporcionInyeccion: (100 - this.parseFloatWithFormat(rows[2][1])) / 100,
      };

      return caracteristicasSistema;
    } catch (error) {
      throw new Error(
        'No se pudieron obtener las características del sistema.',
      );
    }
  }

  async getEconomicas(
    googleSheetClient: sheets_v4.Sheets,
  ): Promise<Economicas> {
    try {
      const response = await googleSheetClient.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.rangeEconomicas,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        throw new Error('No se encontraron datos en el rango especificado.');
      }

      const economicas: Economicas = {
        tipoCambioArs: this.parseFloatWithFormat(rows[0][1]),
        tasaInflacionUsd: this.parseFloatWithFormat(rows[1][1]) / 100,
        tasaDescuentoFlujoFondosUsd: this.parseFloatWithFormat(rows[2][1]) / 100
      };

      return economicas;
    } catch (error) {
      throw new Error('No se pudieron obtener la cotizacion.');
    }
  }

  private parseFloatWithFormat(value: string): number {
    if (!value) return 0; 
    const formattedValue = value.replace('%', '').replace(',', '.').trim();
    const parsedValue = parseFloat(formattedValue);
    return isNaN(parsedValue) ? 0 : parsedValue; 
  }
}
