import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { validateRut } from 'rutlib';
import appConfig from './config/configuration';

@Injectable()
export class AppService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
  ) {}

  getHello(): string {
    return `Hello ${this.config.username}!!`;
  }

  getApikey(): string {
    return `${this.config.apikey}!!`;
  }

  validateRut(rut: string): boolean {
    return validateRut(rut);
  }
}
