import { Request, Response, NextFunction } from "express";
import logger from "../logger";
import { AppError } from "../utils/errors";

export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const requestId = req.requestId;

  if (err instanceof AppError) {
    const payload: any = { message: err.message };
    
    if (process.env.NODE_ENV !== "production") {
      payload.stack = err.stack;
    }

    logger.error("Error", {
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      requestId,
    });

    return res.status(err.statusCode).json(payload);
  }

  const status = err.status || 500;
  const payload: any = { message: err.message || "Internal Server Error" };

  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }

  logger.error("Unhandled Error", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId,
  });

  res.status(status).json(payload);
}
