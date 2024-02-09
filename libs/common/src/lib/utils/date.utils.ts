export function stringToDate(value: Date | string | undefined | null): Date | null {
  if (value) {
    return new Date(new Date(value).getTime());
  }

  return null;
}

export function dateToString(value: Date | undefined | null): string | null {
  return value ? value.toISOString().slice(0, -1) : null;
}

export function dateToDateString(value: Date | undefined | null): string | null {
  return dateToString(value)?.substring(0, 10) || null;
}
