import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GoogleSheetsService } from './google-sheets.service';

@ApiTags('GoogleSheets')
@Controller('google-sheets')
export class GoogleSheetsController {

    constructor(private readonly googleSheetsService : GoogleSheetsService) {

    }

    @Post('create')
    @ApiOperation({summary: 'Crea un registro en la sheet autorizada, pasar nombre de la pestaña, celda y nuevo valor'})
    create(@Query('tabName') tabName: string, @Query('range') range: string, @Body('data') data: any) {
        const values: any = JSON.parse(data);
        return this.googleSheetsService.writeGoogleSheet(tabName, range, values);
    }

    @Get('read')
    @ApiOperation({summary: 'obtiene los datos de la celda apuntada, pasar nombre de la pestaña y coordenadas de la celda'})
    read(@Query('tabName') tabName: string, @Query('range') range: string){
        return this.googleSheetsService.readGoogleSheet(tabName, range);
    }

    @Get('sheet')
    @ApiOperation({summary: 'obtiene todos los datos de la pestaña indicada'})
    getSheet(@Query('tabName') tabName: string) {
        return this.googleSheetsService.readWholeSheetAsJson(tabName);
    }
}
