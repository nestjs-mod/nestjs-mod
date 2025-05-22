export function getAxiosErrorData<T>(err: any) {
  try {
    return err.isAxiosError && err.response ? (err.response.data as T) : null;
  } catch (error) {
    return null;
  }
}
