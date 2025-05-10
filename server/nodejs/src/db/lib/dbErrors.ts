export class DBRowNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DBRowNotFoundError";
  }
}
