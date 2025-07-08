export function getHttpErrorResponseData<T>(err: any) {
  try {
    return 'error' in err && err?.['error'] ? err?.['error'] : null;
  } catch (error) {
    return null;
  }
}
