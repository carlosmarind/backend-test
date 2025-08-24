/* istanbul ignore file */
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

/* istanbul ignore next */
export async function bootstrap() { 
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 4000);

  const logger = new Logger('bootstrap');
  logger.log(`Listening on ${await app.getUrl()}`);
}

// Solo ejecutar si es el archivo principal
/* istanbul ignore next */
if (require.main === module) {
  bootstrap().catch((e) => console.log(`Error al iniciar la aplicacion: ${e}`));
}
