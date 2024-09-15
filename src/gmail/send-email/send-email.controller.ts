import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Express } from 'express';
import { Auth } from 'googleapis';
import * as dotenv from 'dotenv';
import { MailService } from './send-email.service';
import { FileInterceptor } from '@nestjs/platform-express';
dotenv.config();

const { OAuth2Client } = Auth;

@Controller('gmail')
export class SendEmailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-email')
  @UseInterceptors(FileInterceptor('file'))
  async sendEmailWithAttachment(
    @UploadedFile() file: Express.Multer.File,
    @Body('email') email: string,
  ) {
    await this.mailService.sendEmail(
      email,
      'Información de tu navegación',
      '<h1>Gracias por navegar por nuestro sitio!</h1><p>Aquí tienes la información...</p>',
      file
    );
    console.log('Archivo recibido:', file);
    console.log('Enviar a:', email);

    return { message: 'Correo enviado correctamente con el archivo adjunto' };
  }

  @Get('send-email-change')
  async sendEmailChangeCapacityInApi(
    @Query('newPanelCapacityW') newPanelCapacityW: number,
  ) {
    await this.mailService.sendEmail(
      'spereyra.jus@gmail.com',
      'Información de actualización',
      `<h1>Actualización cambio en API solar</h1><p>Google ha actualizado la potencia de los paneles como base para sus calculos solares.</p><p>La nueva potencia es de ${newPanelCapacityW} w`,
    );
  }
}
