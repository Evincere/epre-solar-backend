import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: 'epresjsolar@gmail.com',
        pass: process.env.PASS_GMAIL,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    const mailOptions: nodemailer.Options = {
      from: 'epresjsolar@gmail.com',
      to,
      subject,
      html,
    };

    await this.transporter.sendMail(mailOptions);
  }
}