import { map } from 'rxjs';
import { getText } from './get-text';

export function mapGraphqlErrors<T>() {
  return map((result: { data: T; errors: { message: string }[] }) => {
    const message = result.errors?.[0]?.message;
    if (message) {
      if (message === 'unauthorized') {
        throw new Error(getText('Unauthorized'));
      } else {
        throw new Error(message);
      }
    }
    return result.data;
  });
}
