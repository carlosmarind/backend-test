import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: 3000,
  username: 'usuario',
  apikey: 'API_KEY',  
  database: {
    host: 'localhost',
    port: 5432,
  },
}));
