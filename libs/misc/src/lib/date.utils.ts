export function stringToDate(
  value: Date | string | undefined | null,
  addNowTime?: boolean
): Date | null {
  if (value) {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();
    const msecond = now.getMilliseconds();
    if (addNowTime) {
      return new Date(
        new Date(
          +value +
          hour * 60 * 60 * 100 +
          minute * 60 * 1000 +
          second * 1000 +
          msecond
        ).getTime()
      );
    } else {
      return new Date(new Date(value).getTime());
    }
  }

  return null;
}

export function dateToString<T>(
  value: Date | undefined | null,
  defValue: T,
  addNowTime?: boolean
): string | T {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const msecond = now.getMilliseconds();
  if (!value) {
    return defValue;
  }
  if (addNowTime) {
    return new Date(
      +value +
      hour * 60 * 60 * 100 +
      minute * 60 * 1000 +
      second * 1000 +
      msecond
    ).toISOString();
  } else {
    return value.toISOString();
  }
}

export function dateToDateString(value: Date | undefined | null,
  defValue: string): string | null {
  const d = dateToString(value, defValue);
  if (d) {
    return d.substring(0, 10)
  }
  return null;
}
