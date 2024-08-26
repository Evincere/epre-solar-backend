import { Controller, Get, Param, Query } from '@nestjs/common';
import { Auth } from 'googleapis';
import * as dotenv from 'dotenv';
import { MailService } from './send-email.service';
dotenv.config();

const { OAuth2Client } = Auth;

@Controller('gmail')
export class SendEmailController {
  constructor(private readonly mailService: MailService) {}

  @Get('send-email')
  async finalizarNavegacion(@Query('email') email: string) {
    if (!email) {
      throw new Error('El email es requerido');
    }

    await this.mailService.sendEmail(
      email, 
      'Información de tu navegación',
      '<h1>Gracias por navegar por nuestro sitio!</h1><p>Aquí tienes la información...</p>',
    );

    return { message: 'Email enviado exitosamente' };
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
