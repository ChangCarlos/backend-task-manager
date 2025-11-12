import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const errorSchema = z
  .object({
    message: z.string().openapi({
      description: "Mensagem de erro",
      example: "Task not found",
    }),
  })
  .openapi("Error");

export const validationErrorSchema = z
  .object({
    message: z.string().openapi({
      description: "Mensagem de erro de validação",
      example: "Validation error",
    }),
    details: z
      .array(
        z.object({
          field: z.string().openapi({ example: "title" }),
          message: z.string().openapi({ example: "Title is required" }),
        }),
      )
      .optional()
      .openapi({
        description: "Detalhes dos campos com erro",
      }),
  })
  .openapi("ValidationError");

export const userExistsErrorSchema = z
  .object({
    message: z.string().openapi({
      description: "Mensagem de erro quando usuário já existe",
      example: "User with this email already exists",
    }),
  })
  .openapi("UserExistsError");

export const unauthorizedErrorSchema = z
  .object({
    message: z.string().openapi({
      description: "Mensagem de erro de autenticação",
      example: "Invalid email or password",
    }),
  })
  .openapi("UnauthorizedError");

export const internalServerErrorSchema = z
  .object({
    message: z.string().openapi({
      description: "Mensagem de erro interno do servidor",
      example: "Internal server error",
    }),
  })
  .openapi("InternalServerError");

export const createTaskValidationErrorSchema = z
  .object({
    message: z.string().openapi({
      example: "Validation error",
    }),
    details: z
      .array(
        z.object({
          field: z
            .enum(["title", "description", "completed"])
            .openapi({ example: "title" }),
          message: z
            .string()
            .openapi({ example: "Title must be at least 3 characters" }),
        }),
      )
      .openapi({
        description: "Lista de erros de validação nos campos",
        example: [
          { field: "title", message: "Title must be at least 3 characters" },
          { field: "title", message: "Title must be less than 100 characters" },
        ],
      }),
  })
  .openapi("CreateTaskValidationError");

export const updateTaskValidationErrorSchema = z
  .object({
    message: z.string().openapi({
      example: "Validation error",
    }),
    details: z
      .array(
        z.object({
          field: z
            .enum(["title", "description", "completed"])
            .openapi({ example: "title" }),
          message: z
            .string()
            .openapi({ example: "Title must be at least 3 characters" }),
        }),
      )
      .openapi({
        description: "Lista de erros de validação nos campos",
        example: [
          { field: "completed", message: "Completed must be a boolean" },
        ],
      }),
  })
  .openapi("UpdateTaskValidationError");

export const registerValidationErrorSchema = z
  .object({
    message: z.string().openapi({
      example: "Validation error",
    }),
    details: z
      .array(
        z.object({
          field: z
            .enum(["name", "email", "password"])
            .openapi({ example: "email" }),
          message: z.string().openapi({ example: "Invalid email format" }),
        }),
      )
      .openapi({
        description: "Lista de erros de validação nos campos",
        example: [
          { field: "name", message: "Name must be at least 3 characters" },
          { field: "email", message: "Invalid email format" },
          {
            field: "password",
            message: "Password must be at least 6 characters",
          },
        ],
      }),
  })
  .openapi("RegisterValidationError");

export const loginValidationErrorSchema = z
  .object({
    message: z.string().openapi({
      example: "Validation error",
    }),
    details: z
      .array(
        z.object({
          field: z.enum(["email", "password"]).openapi({ example: "email" }),
          message: z.string().openapi({ example: "Invalid email format" }),
        }),
      )
      .openapi({
        description: "Lista de erros de validação nos campos",
        example: [
          { field: "email", message: "Invalid email format" },
          { field: "password", message: "Password is required" },
        ],
      }),
  })
  .openapi("LoginValidationError");

export type ErrorResponse = z.infer<typeof errorSchema>;
export type ValidationErrorResponse = z.infer<typeof validationErrorSchema>;
export type UserExistsErrorResponse = z.infer<typeof userExistsErrorSchema>;
export type UnauthorizedErrorResponse = z.infer<typeof unauthorizedErrorSchema>;
export type InternalServerErrorResponse = z.infer<
  typeof internalServerErrorSchema
>;
export type CreateTaskValidationErrorResponse = z.infer<
  typeof createTaskValidationErrorSchema
>;
export type UpdateTaskValidationErrorResponse = z.infer<
  typeof updateTaskValidationErrorSchema
>;
export type RegisterValidationErrorResponse = z.infer<
  typeof registerValidationErrorSchema
>;
export type LoginValidationErrorResponse = z.infer<
  typeof loginValidationErrorSchema
>;
