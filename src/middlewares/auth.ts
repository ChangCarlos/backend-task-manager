import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/errors";
import { JwtPayload } from "../types/express";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new UnauthorizedError("No token provided"));
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    return next(new UnauthorizedError("Token error"));
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return next(new UnauthorizedError("Token malformatted"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return next(new UnauthorizedError("Invalid token"));
  }
}
