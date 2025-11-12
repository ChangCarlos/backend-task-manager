import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/errors";
import { JwtPayload } from "../types/express";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token || (() => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    
    const parts = authHeader.split(" ");
    if (parts.length !== 2) return null;
    
    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) return null;
    
    return token;
  })();

  if (!token) {
    return next(new UnauthorizedError("No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return next(new UnauthorizedError("Invalid token"));
  }
}
