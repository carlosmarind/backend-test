import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0'); // 👈 importante
  console.log(`[bootstrap] Listening on http://0.0.0.0:${port}`);
}
bootstrap();