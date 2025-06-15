export function omitObject<T, K extends keyof T>(obj: T, fields: Array<K>): Pick<T, Exclude<keyof T, K>> {
  const shallowCopy = Object.assign({}, obj);
  for (let i = 0; i < fields.length; i += 1) {
    const key = fields[i];
    delete shallowCopy[key];
  }
  return shallowCopy;
}
