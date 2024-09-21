import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log', 'debug', 'verbose'] });

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'User-Agent', 'X-Client-IP'],
    credentials: true,
  });

  const options = new DocumentBuilder()
    .setTitle('Solar API')
    .setDescription('Api para el cálculo de ahorro energético')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/api/docs', app, document, {
    swaggerOptions: {
      filter: true
    }
  });
  // app.useGlobalFilters(new AllExceptionFilter());
  // app.useGlobalInterceptors(new TimeOutInterceptor());
  await app.listen(process.env.PORT || 3000);
}
bootstrap();