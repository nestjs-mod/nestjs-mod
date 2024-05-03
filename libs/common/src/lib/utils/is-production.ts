export function isProductionMode() {
    return  process.env['NESTJS_MODE'] === 'production' || process.env['NODE_ENV'] === 'production'
}