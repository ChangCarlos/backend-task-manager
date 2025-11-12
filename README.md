# Tasks API

API REST completa para gerenciamento de tarefas com autenticação JWT, desenvolvida com Node.js, Express, TypeScript e Prisma.

## Funcionalidades

### Autenticação e Autorização
- Registro de usuários com hash de senha (bcrypt)
- Login com JWT (expires em 1h)
- Proteção de rotas com middleware de autenticação
- Rate limiting em rotas de autenticação (5 tentativas/15min)

### Gerenciamento de Tarefas
- CRUD completo de tarefas
- Isolamento de dados por usuário (cada usuário vê apenas suas tarefas)
- Paginação (page, limit)
- Busca por texto (título e descrição)
- Filtros (completed: true/false)
- Ordenação (createdAt, updatedAt, title - asc/desc)
- Validação de UUID nos parâmetros

### Perfil de Usuário
- Visualizar perfil (`GET /api/users/me`)
- Atualizar nome/email (`PUT /api/users/me`)
- Alterar senha (`PUT /api/users/me/password`)

### Segurança
- Helmet para headers HTTP seguros
- CORS configurado para frontend específico
- Rate limiting global (30 req/15min)
- Validação de entrada com Zod
- Tratamento de erros consistente com status HTTP apropriados
- Logs estruturados com request ID e contexto de usuário

## Tecnologias

- **Runtime:** Node.js
- **Framework:** Express 5
- **Linguagem:** TypeScript
- **ORM:** Prisma
- **Banco de dados:** PostgreSQL
- **Autenticação:** JWT (jsonwebtoken)
- **Validação:** Zod
- **Documentação:** Swagger/OpenAPI
- **Logs:** Winston
- **Segurança:** Helmet, bcrypt, express-rate-limit

## Setup

### Pré-requisitos

- Node.js 18+
- pnpm (ou npm/yarn)
- PostgreSQL 15+
- Docker (opcional)

### Instalação

1. **Clone o repositório:**
```bash
git clone <repo-url>
cd backend
```

2. **Instale as dependências:**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente:**

Copie `.env.example` para `.env` e configure:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myappdb?schema=public
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:3001
```

**IMPORTANTE:** Gere um JWT_SECRET seguro para produção:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

4. **Suba o banco de dados com Docker:**
```bash
docker-compose up -d
```

5. **Execute as migrations:**
```bash
pnpm prisma migrate dev
```

6. **Inicie o servidor:**
```bash
pnpm dev
```

O servidor estará rodando em `http://localhost:3000`

## Documentação da API

Acesse a documentação interativa Swagger em:
```
http://localhost:3000/api-docs
```

### Exemplos de Endpoints

#### Autenticação

**Registrar usuário:**
```bash
POST /api/users/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Login:**
```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "senha123"
}

# Resposta:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Tarefas (requer autenticação)

**Criar tarefa:**
```bash
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Comprar leite",
  "description": "2 litros desnatado"
}
```

**Listar tarefas com filtros:**
```bash
GET /api/tasks?page=1&limit=20&search=comprar&completed=false&orderBy=createdAt&order=desc
Authorization: Bearer {token}

# Resposta:
{
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

**Atualizar tarefa:**
```bash
PUT /api/tasks/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "completed": true
}
```

**Deletar tarefa:**
```bash
DELETE /api/tasks/{id}
Authorization: Bearer {token}
```

#### Perfil (requer autenticação)

**Ver perfil:**
```bash
GET /api/users/me
Authorization: Bearer {token}
```

**Atualizar perfil:**
```bash
PUT /api/users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "João Silva Santos",
  "email": "joao.novo@example.com"
}
```

**Alterar senha:**
```bash
PUT /api/users/me/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "senha123",
  "newPassword": "novaSenha456"
}
```

## Estrutura do Projeto

```
backend/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── migrations/            # Histórico de migrations
├── src/
│   ├── config/
│   │   ├── index.ts          # Configurações gerais
│   │   └── swagger.ts        # Documentação OpenAPI
│   ├── controllers/          # Controllers (camada de apresentação)
│   ├── services/             # Lógica de negócio
│   ├── routes/               # Definição de rotas
│   ├── middlewares/          # Middlewares (auth, validação, etc)
│   │   ├── auth.ts           # Autenticação JWT
│   │   ├── validate.ts       # Validação com Zod
│   │   ├── validateUUID.ts   # Validação de UUID
│   │   ├── rateLimiter.ts    # Rate limiting
│   │   ├── requestId.ts      # Request ID para logs
│   │   └── error.handler.ts  # Tratamento de erros
│   ├── schemas/              # Schemas Zod para validação
│   ├── interfaces/           # Tipos TypeScript
│   ├── types/                # Extensões de tipos
│   ├── utils/
│   │   └── errors.ts         # Classes de erro customizadas
│   ├── lib/
│   │   └── prisma.ts         # Cliente Prisma
│   ├── app.ts                # Configuração Express
│   └── logger.ts             # Configuração Winston
├── server.ts                 # Entry point
├── package.json
├── tsconfig.json
└── docker-compose.yml
```

## Scripts Disponíveis

```bash
# Desenvolvimento com hot reload
pnpm dev

# Build para produção
pnpm build

# Executar versão de produção
pnpm start

# Formatar código
pnpm format

# Executar testes
pnpm test

# Executar testes com cobertura
pnpm test:coverage

# Prisma commands
pnpm prisma studio           # Interface visual do banco
pnpm prisma migrate dev      # Criar nova migration
pnpm prisma migrate deploy   # Aplicar migrations (produção)
pnpm prisma generate         # Gerar Prisma Client
```

## Testes

O projeto possui uma suíte completa de testes com **83 test cases** usando Vitest:

### Estrutura de Testes

```
tests/
├── unit/                     # Testes unitários (41 tests)
│   ├── user.service.test.ts  # 12 tests - lógica de usuários
│   ├── task.service.test.ts  # 15 tests - lógica de tarefas
│   └── middlewares.test.ts   # 14 tests - middlewares
└── integration/              # Testes de integração (42 tests)
    ├── user.test.ts          # 17 tests - endpoints de usuário
    └── task.test.ts          # 25 tests - endpoints de tarefas
```

### Cobertura de Testes

- **Autenticação:** Register, login, JWT, proteção de rotas
- **Perfil:** Visualizar, atualizar, alterar senha
- **Tarefas:** CRUD completo, ownership, filtros, paginação
- **Validação:** Zod schemas, UUID, dados inválidos
- **Segurança:** Rate limiting (desabilitado em testes), hash de senha
- **Middlewares:** Auth, error handler, validate, validateUUID
- **Erros:** 400, 401, 403, 404, 409, 500 status codes

### Executar Testes

```bash
# Todos os testes
pnpm test

# Modo watch (desenvolvimento)
pnpm test:watch

# Com relatório de cobertura
pnpm test:coverage
```

### Tecnologias de Teste

- **Vitest:** Test runner (compatível com Jest, mais rápido)
- **Supertest:** Testes HTTP de integração
- **Prisma Mock:** Mock do Prisma Client para testes unitários

**Resultado:** **83/83 tests passing** (100% success rate)

## Segurança

### Implementações de Segurança

1. **Senhas:** Hash com bcrypt (10 rounds)
2. **JWT:** Tokens com expiração de 1h
3. **CORS:** Restrito ao frontend configurado
4. **Rate Limiting:**
   - Geral: 30 req/15min
   - Auth: 5 req/15min
5. **Validação:** Todos os inputs validados com Zod
6. **Headers:** Helmet para proteção HTTP
7. **Erros:** Não vaza informações sensíveis em produção
8. **UUID:** Validação de formato antes de queries

## Tratamento de Erros

A API retorna erros estruturados com status HTTP apropriados:

- **400 Bad Request:** Dados inválidos ou UUID malformado
- **401 Unauthorized:** Não autenticado ou credenciais inválidas
- **403 Forbidden:** Sem permissão para acessar o recurso
- **404 Not Found:** Recurso não encontrado
- **409 Conflict:** Conflito (ex: email já existe)
- **429 Too Many Requests:** Rate limit excedido
- **500 Internal Server Error:** Erro interno

Exemplo de resposta de erro:
```json
{
  "message": "Invalid UUID format for 'id'"
}
```

## Logs

Os logs são estruturados e incluem:
- **Request ID:** Identificador único da requisição
- **User ID:** ID do usuário autenticado (quando aplicável)
- **Timestamp:** Data/hora do evento
- **Context:** Contexto adicional (método HTTP, path, etc)

Em desenvolvimento: logs coloridos e legíveis
Em produção: logs em JSON para ferramentas de agregação

## Migrations

O projeto usa Prisma Migrate para versionamento do schema:

```bash
# Criar migration (desenvolvimento)
pnpm prisma migrate dev --name descricao_da_mudanca

# Aplicar migrations (produção)
pnpm prisma migrate deploy

# Ver status das migrations
pnpm prisma migrate status

# Resetar banco (APENAS DESENVOLVIMENTO!)
pnpm prisma migrate reset
```

## Deploy

### Variáveis de Ambiente para Produção

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=<generated-secret-key>
FRONTEND_URL=https://seu-frontend.com
LOG_LEVEL=info
```

### Deploy com Docker

```dockerfile
# Dockerfile exemplo
FROM node:18-alpine
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod
COPY . .
RUN pnpm prisma generate
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## Changelog

### v1.0.0 - 2024-11-11

#### Implementado
- Relacionamento User-Task com cascade delete
- Autenticação JWT em todas as rotas de tasks
- Filtros por usuário (isolamento de dados)
- Paginação, busca e ordenação
- Validação de UUID
- Rate limiting (geral e autenticação)
- Profile endpoints (GET/PUT /me, PUT /me/password)
- Logs estruturados com request ID
- Tratamento de erros consistente
- Documentação Swagger completa
- CORS configurável
- Middlewares de segurança

## Contribuindo

1. Faça fork do projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

ISC

## Autores

Desenvolvido para projeto de gerenciamento de tarefas com fins educacionais.

## Suporte

Para dúvidas ou problemas:
1. Consulte a documentação Swagger: `/api-docs`
2. Verifique os logs do servidor
3. Abra uma issue no repositório
