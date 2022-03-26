import dotenv from 'dotenv';
import { env } from 'process';

dotenv.config();

export const config = {
  http: {
    port: +(env.HTTP_PORT || 3002),
  },
  rabbit: {
    host: env.RABBIT_HOST || 'amqp://127.0.0.1:5672',
  },
};

export default config;
