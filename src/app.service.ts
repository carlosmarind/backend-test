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
    
    if (!rut || rut.trim() === '') {
      return false;
    }

   
    if (rut === '11111111-1' || rut === '00000000-0') {
      return false;
    }

    // ✅ usar librería para validar formato y dígito verificador
    return validateRut(rut);
  }
}