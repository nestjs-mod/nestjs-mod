import { Type } from '@nestjs/common';

export function nameItClass(name: string, cls: Type) {
  return { [name]: class extends cls {} }[name];
}
