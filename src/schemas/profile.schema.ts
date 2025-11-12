import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const updateProfileSchema = z
  .object({
    name: z.string().min(1, "Name is required").optional().openapi({
      description: "Nome do usuário",
      example: "João Silva Atualizado",
    }),
    email: z.email("Invalid email format").optional().openapi({
      description: "Email do usuário",
      example: "joao.novo@example.com",
    }),
  })
  .openapi("UpdateProfileInput");

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().openapi({
      description: "Senha atual do usuário",
      example: "senhaAtual123",
    }),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .openapi({
        description: "Nova senha (mínimo 6 caracteres)",
        example: "novaSenha456",
      }),
  })
  .openapi("ChangePasswordInput");

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
