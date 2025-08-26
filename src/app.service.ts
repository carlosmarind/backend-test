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
    const name = this.config?.username ?? '';
    return `Hello ${name}!!`;
  }

  getApikey(): string {
    const key = this.config?.apikey ?? '';
    return `${key}!!`;
  }

  validateRut(rut: string): boolean {
    return validateRut(rut);
  }
}
