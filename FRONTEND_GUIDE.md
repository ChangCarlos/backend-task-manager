# Guia Frontend - Task Manager API

> Documentação simples para iniciantes construírem o frontend

## O que você precisa saber

Este backend gerencia **usuários** e **tarefas**. Cada usuário vê apenas suas próprias tarefas.

**URL base da API:** `http://localhost:3000/api`

---

## Páginas que você precisa criar

### 1. Página de Registro (`/register`)
- Formulário com 3 campos: nome, email e senha
- Botão "Cadastrar"

### 2. Página de Login (`/login`)
- Formulário com 2 campos: email e senha
- Botão "Entrar"

### 3. Página de Tarefas (`/tasks`)
- Lista de tarefas do usuário
- Botão "Nova Tarefa"
- Para cada tarefa: checkbox (completar), botão editar, botão deletar
- Filtro: Todas / Concluídas / Pendentes

### 4. Página de Perfil (`/profile`)
- Mostrar nome e email do usuário
- Formulário para atualizar nome/email
- Formulário para trocar senha

---

## Endpoints da API

### **Autenticação**

#### Cadastrar usuário
```
POST /api/users/register
```
**Enviar:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```
**Resposta (201):**
```json
{
  "id": "uuid-do-usuario",
  "name": "João Silva",
  "email": "joao@email.com"
}
```

#### Login
```
POST /api/users/login
```
**Enviar:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```
**Resposta (200):**
```json
{
  "user": {
    "id": "uuid-do-usuario",
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```
**IMPORTANTE:** O token é enviado automaticamente como **httpOnly cookie**!  
Você **NÃO** precisa salvá-lo no localStorage. O navegador gerencia isso automaticamente de forma mais segura.

#### Logout
```
POST /api/users/logout
```
**Sem headers necessários!** O cookie é enviado automaticamente.

---

### **Tarefas**

> **Boa notícia:** Você NÃO precisa enviar token manualmente!  
> O navegador envia o cookie automaticamente em todas as requisições.

#### Criar tarefa
```
POST /api/tasks
```
**Enviar:**
```json
{
  "title": "Comprar leite",
  "description": "Comprar no supermercado" 
}
```

#### Listar tarefas
```
GET /api/tasks
```
**Resposta:**
```json
{
  "tasks": [
    {
      "id": "uuid-da-tarefa",
      "title": "Comprar leite",
      "description": "Comprar no supermercado",
      "completed": false,
      "createdAt": "2025-11-11T10:00:00.000Z",
      "updatedAt": "2025-11-11T10:00:00.000Z",
      "userId": "uuid-do-usuario"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Filtros opcionais (query params):**
- `?completed=true` - apenas concluídas
- `?completed=false` - apenas pendentes
- `?search=leite` - busca no título/descrição
- `?page=2&limit=5` - paginação
- `?sortBy=title&order=asc` - ordenação

#### Atualizar tarefa
```
PUT /api/tasks/{id}
```
**Enviar (todos opcionais):**
```json
{
  "title": "Comprar leite integral",
  "description": "Nova descrição",
  "completed": true
}
```

#### Deletar tarefa
```
DELETE /api/tasks/{id}
```

---

### **Perfil do Usuário**

#### Ver perfil
```
GET /api/users/me
```
**Resposta:**
```json
{
  "id": "uuid-do-usuario",
  "name": "João Silva",
  "email": "joao@email.com",
  "createdAt": "2025-11-11T10:00:00.000Z"
}
```

#### Atualizar perfil
```
PUT /api/users/me
```
**Enviar (ambos opcionais):**
```json
{
  "name": "João da Silva",
  "email": "joao.novo@email.com"
}
```

#### Trocar senha
```
PUT /api/users/me/password
```
**Enviar:**
```json
{
  "currentPassword": "senha123",
  "newPassword": "novaSenha456"
}
```

---

## Exemplos de código

### Como fazer requisições (JavaScript/Fetch)

> **Com httpOnly cookies você NÃO precisa gerenciar tokens manualmente!**  
> Basta adicionar `credentials: 'include'` nas requisições.

#### 1. Login
```javascript
async function login(email, password) {
  const response = await fetch('http://localhost:3000/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', // Permite receber e enviar cookies
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Salvar apenas dados do usuário (opcional, para exibição)
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } else {
    throw new Error(data.message);
  }
}
```

#### 2. Buscar tarefas
```javascript
async function getTasks() {
  const response = await fetch('http://localhost:3000/api/tasks', {
    credentials: 'include' // Cookie enviado automaticamente
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.tasks;
  } else {
    throw new Error('Erro ao buscar tarefas');
  }
}
```

#### 3. Criar tarefa
```javascript
async function createTask(title, description) {
  const response = await fetch('http://localhost:3000/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', // Cookie enviado automaticamente
    body: JSON.stringify({ title, description })
  });
  
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error('Erro ao criar tarefa');
  }
}
```

#### 4. Marcar tarefa como concluída
```javascript
async function toggleTask(taskId, completed) {
  const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', // Cookie enviado automaticamente
    body: JSON.stringify({ completed })
  });
  
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Erro ao atualizar tarefa');
  }
}
```

#### 5. Deletar tarefa
```javascript
async function deleteTask(taskId) {
  await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
    method: 'DELETE',
    credentials: 'include' // Cookie enviado automaticamente
  });
}
```

---

## Controle de Autenticação

### Como proteger rotas no frontend

Com **httpOnly cookies**, você não tem acesso direto ao token. Para verificar autenticação, tente fazer uma requisição ao endpoint `/api/users/me`:

```javascript
async function isAuthenticated() {
  try {
    const response = await fetch('http://localhost:3000/api/users/me', {
      credentials: 'include'
    });
    return response.ok; 
  } catch {
    return false;
  }
}

// Exemplo de uso
async function protectPage() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    window.location.href = '/login';
  }
}
```

### Logout
```javascript
async function logout() {
  await fetch('http://localhost:3000/api/users/logout', {
    method: 'POST',
    credentials: 'include' // Envia o cookie para ser invalidado
  });
  
  // Limpar dados locais (se tiver salvado algo)
  localStorage.removeItem('user');
  window.location.href = '/login';
}
```

---

## Exemplo de estrutura de tela

### Tela de Tarefas (exemplo HTML simples)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Minhas Tarefas</title>
</head>
<body>
  <h1>Minhas Tarefas</h1>
  
  <form id="new-task-form">
    <input type="text" id="title" placeholder="Título" required>
    <textarea id="description" placeholder="Descrição"></textarea>
    <button type="submit">Adicionar</button>
  </form>
  
  <div>
    <button onclick="filterTasks('all')">Todas</button>
    <button onclick="filterTasks('pending')">Pendentes</button>
    <button onclick="filterTasks('completed')">Concluídas</button>
  </div>
  
  <ul id="tasks-list"></ul>
  
  <script>
    window.onload = loadTasks;
    
    async function loadTasks() {
      const tasks = await getTasks();
      renderTasks(tasks);
    }
    
    function renderTasks(tasks) {
      const list = document.getElementById('tasks-list');
      list.innerHTML = '';
      
      tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
          <input type="checkbox" ${task.completed ? 'checked' : ''} 
                 onchange="toggleTask('${task.id}', this.checked)">
          <span>${task.title}</span>
          <button onclick="deleteTask('${task.id}')">Deletar</button>
        `;
        list.appendChild(li);
      });
    }
    
    document.getElementById('new-task-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      await createTask(title, description);
      loadTasks();
    });
  </script>
</body>
</html>
```

---

## Tratamento de Erros

O backend retorna erros neste formato:

```json
{
  "message": "Descrição do erro",
  "errors": [ /* detalhes */ ]
}
```

**Erros comuns:**
- `401 Unauthorized` - Token inválido ou expirado (redirecionar para login)
- `400 Bad Request` - Dados inválidos (validação)
- `404 Not Found` - Recurso não encontrado
- `409 Conflict` - Email já cadastrado

### Como tratar:
```javascript
try {
  const data = await createTask(title, description);
  alert('Tarefa criada com sucesso!');
} catch (error) {
  alert(`Erro: ${error.message}`);
}
```

---

## Tecnologias recomendadas

**Para iniciantes:**
- HTML + CSS + JavaScript puro (Vanilla JS)
- Ou qualquer framework que você já conhece (React, Vue, Angular)

**Bibliotecas úteis:**
- **Axios** - alternativa ao fetch (mais fácil)
- **React Query** - gerenciar requisições em React
- **SWR** - cache e revalidação automática

---

## 🚀 Checklist para começar

- [ ] Criar página de cadastro
- [ ] Criar página de login (sem gerenciar tokens!)
- [ ] Criar página de tarefas
- [ ] Implementar criação de tarefas
- [ ] Implementar listagem de tarefas
- [ ] Implementar checkbox para completar tarefas
- [ ] Implementar deletar tarefas
- [ ] Adicionar filtros (todas/concluídas/pendentes)
- [ ] Criar página de perfil
- [ ] Implementar logout
- [ ] Proteger rotas (verificar autenticação com endpoint /me)

---

## 🔍 Documentação Swagger

Para ver todos os endpoints e testar diretamente:

**Acesse:** `http://localhost:3000/api-docs`

---

## Dicas finais

1. **Use `credentials: 'include'`** em TODAS as requisições fetch
2. **NÃO tente acessar o token** - ele é httpOnly (mais seguro!)
3. **Limpe dados do usuário** no logout (se salvou no localStorage)
4. **Trate erros 401** redirecionando para login (cookie expirado)
5. **Valide os campos** antes de enviar (mínimo 3 caracteres no título, etc)

### Por que httpOnly cookie é melhor?

| localStorage | httpOnly Cookie |
|--------------|-----------------|
| JavaScript pode acessar | JavaScript NÃO pode acessar |
| Vulnerável a XSS | Protegido contra XSS |
| Você gerencia manualmente | Navegador gerencia automaticamente |

**XSS (Cross-Site Scripting):** Se alguém injetar código malicioso no seu site, NÃO conseguirá roubar o token!

Boa sorte! 
