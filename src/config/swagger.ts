import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { version } from "../../package.json";
import {
  createTaskSchema,
  updateTaskSchema,
  taskSchema,
} from "../schemas/task.schema";
import {
  createUserSchema,
  loginUserSchema,
  userSchema,
  loginResponseSchema,
} from "../schemas/user.schema";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "../schemas/profile.schema";
import {
  errorSchema,
  validationErrorSchema,
  userExistsErrorSchema,
  unauthorizedErrorSchema,
  internalServerErrorSchema,
  createTaskValidationErrorSchema,
  updateTaskValidationErrorSchema,
  registerValidationErrorSchema,
  loginValidationErrorSchema,
} from "../schemas/common.schema";

const registry = new OpenAPIRegistry();

registry.register("Task", taskSchema);
registry.register("CreateTaskInput", createTaskSchema);
registry.register("UpdateTaskInput", updateTaskSchema);
registry.register("User", userSchema);
registry.register("CreateUserInput", createUserSchema);
registry.register("LoginUserInput", loginUserSchema);
registry.register("LoginResponse", loginResponseSchema);
registry.register("UpdateProfileInput", updateProfileSchema);
registry.register("ChangePasswordInput", changePasswordSchema);
registry.register("Error", errorSchema);
registry.register("ValidationError", validationErrorSchema);
registry.register("UserExistsError", userExistsErrorSchema);
registry.register("UnauthorizedError", unauthorizedErrorSchema);
registry.register("InternalServerError", internalServerErrorSchema);
registry.register("CreateTaskValidationError", createTaskValidationErrorSchema);
registry.register("UpdateTaskValidationError", updateTaskValidationErrorSchema);
registry.register("RegisterValidationError", registerValidationErrorSchema);
registry.register("LoginValidationError", loginValidationErrorSchema);

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

registry.registerPath({
  method: "post",
  path: "/api/tasks",
  tags: ["Tasks"],
  summary: "Criar uma nova tarefa",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createTaskSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Tarefa criada com sucesso",
      content: {
        "application/json": {
          schema: taskSchema,
        },
      },
    },
    400: {
      description: "Dados de entrada inválidos",
      content: {
        "application/json": {
          schema: createTaskValidationErrorSchema,
        },
      },
    },
    401: {
      description: "Não autenticado",
      content: {
        "application/json": {
          schema: unauthorizedErrorSchema,
        },
      },
    },
    500: {
      description: "Erro interno do servidor",
      content: {
        "application/json": {
          schema: internalServerErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/tasks",
  tags: ["Tasks"],
  summary: "Listar todas as tarefas do usuário",
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      page: z.string().optional().openapi({ example: "1" }),
      limit: z.string().optional().openapi({ example: "20" }),
      search: z.string().optional().openapi({ example: "comprar" }),
      completed: z.string().optional().openapi({ example: "false" }),
      orderBy: z.enum(["createdAt", "updatedAt", "title"]).optional().openapi({ example: "createdAt" }),
      order: z.enum(["asc", "desc"]).optional().openapi({ example: "desc" }),
    }),
  },
  responses: {
    200: {
      description: "Lista paginada de tarefas",
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(taskSchema),
            total: z.number().openapi({ example: 42 }),
            page: z.number().openapi({ example: 1 }),
            limit: z.number().openapi({ example: 20 }),
            totalPages: z.number().openapi({ example: 3 }),
          }),
        },
      },
    },
    401: {
      description: "Não autenticado",
      content: {
        "application/json": {
          schema: unauthorizedErrorSchema,
        },
      },
    },
    500: {
      description: "Erro interno do servidor",
      content: {
        "application/json": {
          schema: internalServerErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/tasks/{id}",
  tags: ["Tasks"],
  summary: "Buscar tarefa por ID",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.uuid(),
    }),
  },
  responses: {
    200: {
      description: "Tarefa encontrada",
      content: {
        "application/json": {
          schema: taskSchema,
        },
      },
    },
    400: {
      description: "UUID inválido",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
    401: {
      description: "Não autenticado",
      content: {
        "application/json": {
          schema: unauthorizedErrorSchema,
        },
      },
    },
    403: {
      description: "Sem permissão para acessar esta tarefa",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
    404: {
      description: "Tarefa não encontrada",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
    500: {
      description: "Erro interno do servidor",
      content: {
        "application/json": {
          schema: internalServerErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/tasks/{id}",
  tags: ["Tasks"],
  summary: "Atualizar tarefa",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: updateTaskSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Tarefa atualizada com sucesso",
      content: {
        "application/json": {
          schema: taskSchema,
        },
      },
    },
    400: {
      description: "Dados de entrada inválidos ou UUID inválido",
      content: {
        "application/json": {
          schema: updateTaskValidationErrorSchema,
        },
      },
    },
    401: {
      description: "Não autenticado",
      content: {
        "application/json": {
          schema: unauthorizedErrorSchema,
        },
      },
    },
    403: {
      description: "Sem permissão para atualizar esta tarefa",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
    404: {
      description: "Tarefa não encontrada",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
    500: {
      description: "Erro interno do servidor",
      content: {
        "application/json": {
          schema: internalServerErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/tasks/{id}",
  tags: ["Tasks"],
  summary: "Deletar tarefa",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.uuid(),
    }),
  },
  responses: {
    204: {
      description: "Tarefa deletada com sucesso",
    },
    400: {
      description: "UUID inválido",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
    401: {
      description: "Não autenticado",
      content: {
        "application/json": {
          schema: unauthorizedErrorSchema,
        },
      },
    },
    403: {
      description: "Sem permissão para deletar esta tarefa",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
    404: {
      description: "Tarefa não encontrada",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
    500: {
      description: "Erro interno do servidor",
      content: {
        "application/json": {
          schema: internalServerErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/users/register",
  tags: ["Users"],
  summary: "Registrar novo usuário",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Usuário criado com sucesso",
      content: {
        "application/json": {
          schema: userSchema,
        },
      },
    },
    400: {
      description: "Dados de entrada inválidos",
      content: {
        "application/json": {
          schema: registerValidationErrorSchema,
        },
      },
    },
    409: {
      description: "Email já cadastrado",
      content: {
        "application/json": {
          schema: userExistsErrorSchema,
        },
      },
    },
    500: {
      description: "Erro interno do servidor",
      content: {
        "application/json": {
          schema: internalServerErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/users/login",
  tags: ["Users"],
  summary: "Fazer login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login realizado com sucesso",
      content: {
        "application/json": {
          schema: loginResponseSchema,
        },
      },
    },
    400: {
      description: "Dados de entrada inválidos",
      content: {
        "application/json": {
          schema: loginValidationErrorSchema,
        },
      },
    },
    401: {
      description: "Credenciais inválidas",
      content: {
        "application/json": {
          schema: unauthorizedErrorSchema,
        },
      },
    },
    500: {
      description: "Erro interno do servidor",
      content: {
        "application/json": {
          schema: internalServerErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/users/me",
  tags: ["Profile"],
  summary: "Obter perfil do usuário autenticado",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Perfil do usuário",
      content: {
        "application/json": {
          schema: userSchema,
        },
      },
    },
    401: {
      description: "Não autenticado",
      content: {
        "application/json": {
          schema: unauthorizedErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/users/me",
  tags: ["Profile"],
  summary: "Atualizar perfil do usuário",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateProfileSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Perfil atualizado com sucesso",
      content: {
        "application/json": {
          schema: userSchema,
        },
      },
    },
    400: {
      description: "Dados inválidos",
      content: {
        "application/json": {
          schema: validationErrorSchema,
        },
      },
    },
    401: {
      description: "Não autenticado",
      content: {
        "application/json": {
          schema: unauthorizedErrorSchema,
        },
      },
    },
    409: {
      description: "Email já em uso",
      content: {
        "application/json": {
          schema: userExistsErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/users/me/password",
  tags: ["Profile"],
  summary: "Alterar senha do usuário",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: changePasswordSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Senha alterada com sucesso",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string().openapi({ example: "Password changed successfully" }),
          }),
        },
      },
    },
    400: {
      description: "Dados inválidos",
      content: {
        "application/json": {
          schema: validationErrorSchema,
        },
      },
    },
    401: {
      description: "Senha atual incorreta ou não autenticado",
      content: {
        "application/json": {
          schema: unauthorizedErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/health",
  tags: ["Health"],
  summary: "Verificar status da API",
  responses: {
    200: {
      description: "API está funcionando",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              status: {
                type: "string",
                example: "ok",
              },
              timestamp: {
                type: "string",
                format: "date-time",
              },
            },
          },
        },
      },
    },
  },
});

const generator = new OpenApiGeneratorV3(registry.definitions);

export const swaggerSpec = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Tasks API Documentation",
    version,
    description: "API REST para gerenciamento de tarefas com autenticação JWT",
    contact: {
      name: "API Support",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor de desenvolvimento",
    },
  ],
  tags: [
    {
      name: "Tasks",
      description: "Endpoints para gerenciamento de tarefas (requer autenticação)",
    },
    {
      name: "Users",
      description: "Endpoints de autenticação e registro",
    },
    {
      name: "Profile",
      description: "Endpoints de perfil do usuário (requer autenticação)",
    },
    {
      name: "Health",
      description: "Status da API",
    },
  ],
});
