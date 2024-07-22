import { Controller, Get } from '@nestjs/common';
import { Auth } from 'googleapis';
import * as dotenv from 'dotenv';
import { MailService } from './send-email.service';
dotenv.config();

const { OAuth2Client } = Auth;

@Controller('gmail')
export class SendEmailController {

    constructor(private readonly mailService: MailService) {
    }
    
    @Get('send-email')
    async finalizarNavegacion() {
      //todo: lógica para obtener la información a enviar por email ...
      await this.mailService.sendEmail(
        'spereyra.jus@gmail.com',
        'Información de tu navegación',
        '<h1>Gracias por navegar por nuestro sitio!</h1><p>Aquí tienes la información...</p>'
      );
    }
}
