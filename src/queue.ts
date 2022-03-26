import amqp from 'amqplib';
import config from './config';

const exchange = 'events';
const queue = 'events-sse';

export async function createQueueClient(callback?: ({ event, payload }: { event: string; payload: any }) => void) {
  const connection = await amqp.connect(config.rabbit.host);
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
