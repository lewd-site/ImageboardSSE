import Koa from 'koa';
import { PassThrough } from 'stream';

interface SSEClient {
  readonly id: number;
  readonly stream: PassThrough;
}

const KEEPALIVE_INTERVAL = 30000;

export class SSEController {
  protected nextClientId = 1;
  protected clients: SSEClient[] = [];

  protected nextMessageId = 1;

  public constructor() {
    setInterval(() => {
      this.clients.forEach((client) => {
        client.stream.write(`:keepalive\n\n`);
      });
    }, KEEPALIVE_INTERVAL);
  }

  public index = async (ctx: Koa.Context) => {
    ctx.request.socket.setTimeout(0);

    ctx.req.socket.setNoDelay(true);
    ctx.req.socket.setKeepAlive(true);

    ctx.set('Content-Type', 'text/event-stream');
    ctx.set('Cache-Control', 'no-cache');
    ctx.set('Connection', 'keep-alive');
    ctx.set('X-Accel-Buffering', 'no');

    ctx.status = 200;
    ctx.flushHeaders();

    const stream = new PassThrough();
    stream.write(`:keepalive\n\n`);
    ctx.body = stream;

    const id = this.nextClientId++;
    this.clients.push({ id, stream });

    stream.on('close', () => (this.clients = this.clients.filter((client) => client.id !== id)));
  };

  public broadcast = (event: string, payload: any) => {
    const id = this.nextMessageId++;

    this.clients.forEach((client) => {
      client.stream.write(`event: ${event}\n`);
      client.stream.write(`data: ${JSON.stringify(payload)}\n`);
      client.stream.write(`id: ${id}\n\n`);
    });
  };
}
