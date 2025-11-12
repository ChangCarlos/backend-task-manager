import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const createTaskSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be less than 100 characters")
      .openapi({
        description: "Título da tarefa",
        example: "Comprar leite",
      }),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional()
      .openapi({
        description: "Descrição detalhada da tarefa",
        example: "Comprar 2 litros de leite desnatado no supermercado",
      }),
  })
  .openapi("CreateTaskInput");

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be less than 100 characters")
      .optional()
      .openapi({
        description: "Título da tarefa",
        example: "Comprar leite integral",
      }),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional()
      .openapi({
        description: "Descrição detalhada da tarefa",
        example: "Comprar 3 litros de leite integral",
      }),
    completed: z.boolean().optional().openapi({
      description: "Status de conclusão da tarefa",
      example: true,
    }),
  })
  .openapi("UpdateTaskInput");

export const taskSchema = z
  .object({
    id: z.string().uuid().openapi({
      description: "ID único da tarefa",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    title: z.string().openapi({
      description: "Título da tarefa",
      example: "Comprar leite",
    }),
    description: z.string().nullable().openapi({
      description: "Descrição detalhada da tarefa",
      example: "Comprar 2 litros de leite desnatado no supermercado",
    }),
    completed: z.boolean().openapi({
      description: "Status de conclusão da tarefa",
      example: false,
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
  .openapi("Task");

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type Task = z.infer<typeof taskSchema>;
