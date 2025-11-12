import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/errors";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateUUID(paramName: string = "id") {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[paramName];

    if (!value) {
      return next(new BadRequestError(`Parameter '${paramName}' is required`));
    }

    if (!UUID_REGEX.test(value)) {
      return next(new BadRequestError(`Invalid UUID format for '${paramName}'`));
    }

    next();
  };
}
