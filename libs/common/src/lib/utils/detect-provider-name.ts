// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function detectProviderName(provider: any) {
  if (typeof provider === 'string' || typeof provider === 'symbol') {
    return String(provider);
  }
  if ('provide' in provider) {
    try {
      const detected = provider['provide'];
      if (typeof detected === 'string' || typeof detected === 'symbol') {
        return String(detected);
      }
      if ('name' in detected) {
        return detected.name;
      }
      return undefined;
    } catch (err) {
      return undefined;
    }
  }
  try {
    if (typeof provider === 'string' || typeof provider === 'symbol') {
      return String(provider);
    }
    if ('name' in provider) {
      return provider.name;
    }
    return undefined;
  } catch (err) {
    return undefined;
  }
}
