export class NestApplicationError extends Error {
  constructor(message?: string) {
    super(message);
  }
}
