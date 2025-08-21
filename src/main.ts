import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;           // usa 3000 por defecto
  await app.listen(port, '0.0.0.0');               // 👈 importante: todas las interfaces
}
bootstrap();
