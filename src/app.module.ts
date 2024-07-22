import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { SolarModule } from './solar/solar.module';
import { AuthModule } from './auth/auth.module';
import { GoogleSheetsModule } from './google-sheets/google-sheets.module';
import { GmailModule } from './gmail/gmail.module';

@Module({
  imports: [
    SolarModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.development'],
      isGlobal: true,
    }),
    AuthModule,
    GoogleSheetsModule,
    GmailModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
