export function isInfrastructureMode() {
  return process.env['NESTJS_MODE'] === 'infrastructure' || process.env['NODE_ENV'] === 'infrastructure';
}
