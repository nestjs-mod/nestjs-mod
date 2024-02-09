import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export function getRequestFromExecutionContext(ctx: ExecutionContext) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let req: any;
  try {
    const contextType: string = ctx.getType();
    switch (contextType) {
      case 'http':
        req = ctx.switchToHttp().getRequest();
        break;
      case 'graphql':
        [, , req] = ctx.getArgs();
        break;
      default:
        req = ctx;
        break;
    }
  } catch (err) {
    req = ctx;
  }

  return req?.connection?.parser?.incoming || req?.req?.extra?.request || req?.req || req;
}

export const Request = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  return getRequestFromExecutionContext(ctx);
});
