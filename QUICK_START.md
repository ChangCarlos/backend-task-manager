# Guia de Início Rápido

## Setup em 3 minutos

### Instalar dependências
```bash
pnpm install
```

### Configurar ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env e adicionar um JWT_SECRET seguro
# Gerar secret (copie o output):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Subir banco de dados
```bash
docker-compose up -d
```

### Rodar migrations
```bash
pnpm prisma migrate dev
```

### Iniciar servidor
```bash
pnpm dev
```

API rodando em: http://localhost:3000
Documentação: http://localhost:3000/api-docs

---

## Testar a API

> **Esta API usa httpOnly cookies para autenticação**  
> Use Postman, Insomnia ou `curl -c/-b` para gerenciar cookies automaticamente.

### 1. Registrar usuário
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

### 2. Fazer login (salvar cookies)
```bash
# -c cookies.txt salva o cookie recebido
curl -X POST http://localhost:3000/api/users/login \
  -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

**O token é salvo automaticamente em `cookies.txt`!**

### 3. Criar tarefa (usando o cookie)
```bash
# -b cookies.txt envia o cookie salvo
curl -X POST http://localhost:3000/api/tasks \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Minha primeira tarefa",
    "description": "Testar a API"
  }'
```

### 4. Listar tarefas
```bash
curl -X GET "http://localhost:3000/api/tasks?page=1&limit=10" \
  -b cookies.txt
```

### 💡 Dica: Use Postman para testes mais fáceis!
O Postman gerencia cookies automaticamente. 

---

## Prisma Studio (Interface visual do banco)

```bash
pnpm prisma studio
```

Abre em: http://localhost:5555

---

## Comandos Úteis

```bash
# Ver logs em tempo real
pnpm dev

# Formatar código
pnpm format

# Build para produção
pnpm build

# Rodar versão de produção
pnpm start

# Ver status das migrations
pnpm prisma migrate status

# Resetar banco (CUIDADO!)
pnpm prisma migrate reset
```

---

## Próximos Passos

1. API básica funcionando
2. Conectar frontend
3. Adicionar testes
4. Deploy em produção

---

## Problemas Comuns

### Erro: "Port 3000 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### Erro: "Database connection failed"
```bash
# Verificar se PostgreSQL está rodando
docker ps

# Reiniciar containers
docker-compose down
docker-compose up -d
```

### Erro: "JWT_SECRET is not defined"
```bash
# Verificar se .env existe e tem JWT_SECRET
cat .env

# Se não existir, criar:
cp .env.example .env
# E adicionar um JWT_SECRET
```

---

## Documentação Completa

Ver [README.md](./README.md) para documentação detalhada.
