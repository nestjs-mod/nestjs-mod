export function isInfrastructureMode() {
  return process.env['NODE_ENV'] === 'infrastructure';
}
