import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { validateRut as rutValidator } from 'rutlib';
import appConfig from './config/configuration';

@Injectable()
export class AppService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
  ) {}

  getHello(): string {
    const username = this.config?.username ?? 'User';
    return `Hello ${username}!!`;
  }

  getApikey(): string {
    const apikey = this.config?.apikey ?? '';
    return `${apikey}!!`;
  }

  validateRut(rut?: string): boolean {
    if (!rut || typeof rut !== 'string') {
      return false;
    }
    return rutValidator(rut);
  }
}
