import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 4000);
  const logger = new Logger('bootstrap');
  logger.log(`Listening on ${await app.getUrl()}`);
  return app; // 👈 importante para que los tests no reciban undefined
}

// Solo arrancar servidor en modo normal, no en test
if (process.env.NODE_ENV !== 'test' && require.main === module) {
  bootstrap().catch((e) => console.log(`Error al iniciar la aplicacion: ${e}`));
}