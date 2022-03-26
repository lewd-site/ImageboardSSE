import Koa from 'koa';
import { PassThrough } from 'stream';

interface SSEClient {
  readonly id: number;
  readonly stream: PassThrough;
}

export class SSEController {
  protected nextClientId = 1;
  protected clients: SSEClient[] = [];

  protected nextMessageId = 1;

  public constructor() {}

  public index = async (ctx: Koa.Context) => {
    ctx.request.socket.setTimeout(0);

    ctx.req.socket.setNoDelay(true);
    ctx.req.socket.setKeepAlive(true);

    ctx.set('Content-Type', 'text/event-stream');
    ctx.set('Cache-Control', 'no-cache');
    ctx.set('Connection', 'keep-alive');

    ctx.status = 200;

    const stream = new PassThrough();
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