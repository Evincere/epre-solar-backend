import { Injectable, OnModuleInit } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';

@Injectable()
export class GoogleSheetsService implements OnModuleInit {
  private serviceAccountKeyFile = "./credentials.json";
  private sheetId = process.env.SHEET_ID
  private googleSheetClient: sheets_v4.Sheets;
  
  async onModuleInit() {
    this.googleSheetClient = await this.getGoogleSheetClient();
  }

  async getGoogleSheetClient() {
    const auth = new google.auth.GoogleAuth({
      keyFile: this.serviceAccountKeyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const authClient = await auth.getClient();
    return google.sheets({
      version: 'v4',
      auth: authClient,
    });
  }

  async readGoogleSheet(tabName: string, range: string) {
    const res = await this.googleSheetClient.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range: `${tabName}!${range}`,
    });
    return res.data.values;
  }

  async writeGoogleSheet(tabName: string, range: string, data: any) {
    await this.googleSheetClient.spreadsheets.values.append({
      spreadsheetId: this.sheetId,
      range: `${tabName}!${range}`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        majorDimension: "ROWS",
        values: data
      },
    })
  }

  async readWholeSheetAsJson(tabName: string) {
    const range = 'A1:Z1000';
    const res = await this.googleSheetClient.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range: `${tabName}!${range}`,
    });

    const rows = res.data.values;

    if (!rows || rows.length === 0) {
      return [];
    }

    const headers = rows[0];
    const data = rows.slice(1);

    const jsonData = data.map(row => {
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index] || null;
      });
      return rowData;
    });

    return jsonData;
  }


}
