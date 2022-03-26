import Koa from 'koa';

export function errorHandler() {
  return async function (ctx: Koa.Context, next: Koa.Next) {
    try {
      await next();
    } catch (err) {
      ctx.status = 500;
      ctx.body = { status: 500, message: 'internal_server_error' };

      console.error(err);
    }
  };
}
