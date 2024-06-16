// src/google-sheets/google-sheets.module.ts
import { Module } from '@nestjs/common';
import { GoogleSheetsService } from './google-sheets.service';
import { GoogleSheetsController } from './google-sheets.controller';

@Module({
  providers: [GoogleSheetsService],
  exports: [GoogleSheetsService],
  controllers: [GoogleSheetsController],
})
export class GoogleSheetsModule {}
