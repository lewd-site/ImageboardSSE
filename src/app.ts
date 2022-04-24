import Koa from 'koa';
import logger from 'koa-logger';
import cors from '@koa/cors';
import helmet from 'koa-helmet';
import Router from 'koa-router';
import { errorHandler } from './middleware/error-handler';
import { SSEController } from './controllers/sse-controllers';
import { createQueueClient } from './queue';

export function createApp() {
  const sseController = new SSEController();
  createQueueClient(({ event, payload }) => sseController.broadcast(event, payload));

  const router = new Router();
  router.get('/sse', sseController.index);

  const app = new Koa();
  if (process.env.NODE_ENV === 'development') {
    app.use(logger());
  }

  app.use(helmet.contentSecurityPolicy());
  app.use(helmet.referrerPolicy());
  app.use(helmet.noSniff());
  app.use(helmet.dnsPrefetchControl());
  app.use(helmet.hidePoweredBy());
  app.use(cors());
  app.use(errorHandler());
  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
}
