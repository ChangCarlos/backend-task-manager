import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const createUserSchema = z
  .object({
    name: z.string().min(1, "Name is required").openapi({
      description: "Nome completo do usuário",
      example: "João Silva",
    }),
    email: z.string().email("Invalid email format").openapi({
      description: "Email único do usuário (será validado)",
      example: "joao.silva@example.com",
    }),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .openapi({
        description:
          "Senha do usuário (mínimo 6 caracteres, será criptografada)",
        example: "senhaSegura!23",
      }),
  })
  .openapi("CreateUserInput");

export const loginUserSchema = z
  .object({
    email: z.string().email("Invalid email format").openapi({
      description: "Email cadastrado do usuário",
      example: "joao.silva@example.com",
    }),
    password: z.string().openapi({
      description: "Senha do usuário",
      example: "senhaSegura!23",
    }),
  })
  .openapi("LoginUserInput");

export const userSchema = z
  .object({
    id: z.string().uuid().openapi({
      description: "ID único do usuário",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    name: z.string().openapi({
      description: "Nome do usuário",
      example: "João Silva",
    }),
    email: z.string().email().openapi({
      description: "Email do usuário",
      example: "joao.silva@example.com",
    }),
    createdAt: z.date().openapi({
      description: "Data de criação",
      example: "2025-11-10T10:30:00.000Z",
    }),
    updatedAt: z.date().openapi({
      description: "Data da última atualização",
      example: "2025-11-10T10:30:00.000Z",
    }),
  })
  .openapi("User", {
    description:
      "Nota: A senha nunca é retornada nas respostas da API por segurança",
  });

export const loginResponseSchema = z
  .object({
    user: z.object({
      id: z.uuid().openapi({
        description: "ID único do usuário",
        example: "123e4567-e89b-12d3-a456-426614174000",
      }),
      name: z.string().openapi({
        description: "Nome do usuário",
        example: "João Silva",
      }),
      email: z.email().openapi({
        description: "Email do usuário",
        example: "joao.silva@example.com",
      }),
    }).openapi({
      description: "Dados básicos do usuário autenticado",
    }),
  })
  .openapi("LoginResponse", {
    description:
      "Resposta de login bem-sucedido. O token JWT é enviado via cookie httpOnly (não aparece no body da resposta por segurança).",
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type User = z.infer<typeof userSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
