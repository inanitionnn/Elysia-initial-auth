import { Logger } from "winston";
import createError from "http-errors";

export class MyError {
  private logger;
  constructor(logger?: Logger) {
    this.logger = logger;
  }

  public new(title: string, statusCode: number, error: any) {
    if (error.errors) {
      this.logger?.error(title, error.errors);
      return createError(
        statusCode,
        `${error.errors[0].path[0]}: ${error.errors[0].message}.`,
      );
    } else if (typeof error === "string") {
      this.logger?.error(title, error);
      return createError(statusCode, `${error}.`);
    } else {
      this.logger?.error(title, error);
      return createError(statusCode, `${error.message}.`);
    }
  }
}
