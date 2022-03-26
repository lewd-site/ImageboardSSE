import amqp from 'amqplib';
import Koa from 'koa';
import helmet from 'koa-helmet';
import Router from 'koa-router';
import { errorHandler } from './middleware/error-handler';

const host = 'amqp://localhost';
const exchange = 'events';
const queue = 'events-sse';

async function createQueueClient(callback?: ({ event, payload }: { event: string; payload: any }) => void) {
  const connection = await amqp.connect(host);
  const channel = await connection.createChannel();

  await channel.assertExchange(exchange, 'fanout', { durable: true });

  const assertQueue = await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(assertQueue.queue, exchange, '');
  await channel.prefetch(1);
  await channel.consume(
    assertQueue.queue,
    (msg) => {
      if (msg === null) {
        return;
      }

      if (callback) {
        callback(JSON.parse(msg.content.toString()));
      }

      channel.ack(msg);
    },
    { noAck: false }
  );
}

export function createApp() {
  createQueueClient();

  const router = new Router();
  router.get('/sse', (ctx) => (ctx.body = 'Howdy world!'));

  const app = new Koa();
  app.use(helmet.contentSecurityPolicy());
  app.use(helmet.referrerPolicy());
  app.use(helmet.noSniff());
  app.use(helmet.dnsPrefetchControl());
  app.use(helmet.hidePoweredBy());
  app.use(errorHandler());
  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
}
