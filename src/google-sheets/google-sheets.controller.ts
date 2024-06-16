import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GoogleSheetsService } from './google-sheets.service';

@ApiTags('GoogleSheets')
@Controller('google-sheets')
export class GoogleSheetsController {

    constructor(private readonly googleSheetsService : GoogleSheetsService) {

    }

    @Post('create')
    create(@Query('tabName') tabName: string, @Query('range') range: string, @Body('data') data: any) {
        const values: any = JSON.parse(data);
        return this.googleSheetsService.writeGoogleSheet(tabName, range, values);
    }

    @Get('read')
    read(@Query('tabName') tabName: string, @Query('range') range: string){
        return this.googleSheetsService.readGoogleSheet(tabName, range);
    }

    @Get('sheet')
    getSheet(@Query('tabName') tabName: string) {
        return this.googleSheetsService.readWholeSheetAsJson(tabName);
    }
}
