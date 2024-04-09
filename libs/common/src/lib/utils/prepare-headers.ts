// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function prepareHeaders(headers: any): any {
  return Object.fromEntries(Object.entries(headers || {}).map(([key, value]) => [key.toLowerCase(), value]));
}
