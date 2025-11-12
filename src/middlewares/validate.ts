import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export default function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return res.status(400).json({
          message: "Validation error",
          details,
        });
      }
      next(error);
    }
  };
}
