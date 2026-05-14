# 🌱 Mark Fruit

Marketplace nichado para hortifruti — frutas, verduras, plantas e sementes direto do produtor para o consumidor.

> **TCC** — Maria, Maria, Luiza & Yago

---

## ✨ Funcionalidades

### Consumidor
- Cadastro e login
- Perfil editável
- Tela inicial com busca e melhores posts (avaliação + proximidade)
- Seção "Como Plantar" com bot e loja de sementes
- Chat em tempo real com produtores
- Avaliação dos produtos

### Produtor
- Cadastro e login
- Perfil editável
- Criar anúncio (imagem + descrição + preço + categoria + estoque)
- Receber e responder mensagens dos consumidores
- Mesmo acesso à seção "Como Plantar"

---

## 🛠️ Stack

| Camada    | Tecnologias                                                 |
| --------- | ----------------------------------------------------------- |
| Frontend  | React 18 · Vite · TailwindCSS · React Router · Axios · Socket.io-client · Lucide icons |
| Backend   | Node.js · Express · JWT · bcrypt · Multer · Socket.io       |
| Banco     | SQLite (file-based) · Prisma ORM                            |
| Bot       | Base de conhecimento local (em `backend/src/routes/bot.js`) |

---

## 📁 Estrutura

```
mark-fruit/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma            # tabelas do banco
│   ├── src/
│   │   ├── lib/                     # prisma client + seed
│   │   ├── middleware/auth.js       # autenticação JWT
│   │   ├── routes/
│   │   │   ├── auth.js              # /api/auth/{register,login}
│   │   │   ├── users.js             # /api/users/me, /:id
│   │   │   ├── posts.js             # /api/posts (CRUD + busca/ordenação)
│   │   │   ├── ratings.js           # /api/posts/:id/ratings
│   │   │   ├── messages.js          # /api/conversations, /api/posts/:id/messages
│   │   │   └── bot.js               # /api/bot/{ask,topics}
│   │   └── server.js                # Express + Socket.io
│   ├── uploads/                     # imagens enviadas
│   ├── .env                         # configuração local
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/              # Navbar, PostCard, Stars, PrivateRoute
    │   ├── context/AuthContext.jsx  # estado global de autenticação
    │   ├── pages/                   # Home, Login, Register, Profile, NewPost,
    │   │                            # PostDetail, ComoPlantar, Conversations, Chat
    │   ├── services/api.js          # cliente axios
    │   └── main.jsx + App.jsx
    └── package.json
```

---

## 🚀 Como rodar (passo a passo)

### Pré-requisitos
- Node.js 18+ (testado em v24)
- npm

### 1. Backend

```powershell
cd backend
npm install
npx prisma migrate dev --name init   # cria o banco SQLite
node src/lib/seed.js                  # popula com dados de exemplo
npm run dev                           # roda em http://localhost:3001
```

**Logins de teste (senha `123456`):**
- Consumidor: `ana@markfruit.com`
- Produtor 1: `joaquim@markfruit.com`
- Produtor 2: `maria@markfruit.com`

### 2. Frontend (em outro terminal)

```powershell
cd frontend
npm install
npm run dev    # roda em http://localhost:5173
```

Abra `http://localhost:5173` no navegador.

---

## ⚠️ Dica para Windows / PowerShell

Se o PowerShell bloquear o `npm` com erro de execution policy, abra um PowerShell como administrador e rode:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Ou use `npm.cmd` no lugar de `npm`.

---

## 🔌 Endpoints principais da API

| Método | Rota                                   | Descrição                           |
| ------ | -------------------------------------- | ----------------------------------- |
| POST   | `/api/auth/register`                   | Cadastro (consumer ou producer)     |
| POST   | `/api/auth/login`                      | Login                               |
| GET    | `/api/users/me`                        | Perfil do usuário logado            |
| PUT    | `/api/users/me`                        | Atualizar perfil                    |
| GET    | `/api/posts`                           | Listar (suporta `?q=&category=&sort=best\|rating\|nearest&lat=&lon=`) |
| POST   | `/api/posts`                           | Criar anúncio (produtor + multipart) |
| GET    | `/api/posts/:id`                       | Detalhe do post + avaliações        |
| POST   | `/api/posts/:id/ratings`               | Avaliar (1-5 estrelas + comentário) |
| GET    | `/api/conversations`                   | Conversas do usuário                |
| GET    | `/api/posts/:postId/messages/:otherId` | Histórico de mensagens              |
| POST   | `/api/bot/ask`                         | Perguntar ao PlantaBot              |

**Socket.io**: evento `chat:send { postId, receiverId, content }` envia mensagem em tempo real; clientes escutam `chat:message`.

---

## 🌿 Como o bot funciona

O `PlantaBot` é uma base de conhecimento local (`backend/src/routes/bot.js`) com guias para tomate, alface, cenoura, milho, maçã, morango, banana, pimentão e cebola.

Ele detecta a planta na mensagem e o tópico (clima, solo, plantio, água, colheita, dicas) e responde de acordo. **Para plugar uma IA real** (Claude API, OpenAI, etc.), basta substituir a função no `router.post("/ask", ...)`.

---

## 📦 Próximos passos sugeridos

- [ ] Integrar pagamentos (Mercado Pago / Stripe)
- [ ] Notificações push de novas mensagens
- [ ] Sistema de favoritos
- [ ] Recuperação de senha por email
- [ ] Deploy (Vercel + Render/Railway)
- [ ] Migrar SQLite → PostgreSQL em produção
- [ ] Plugar Claude/GPT no bot

---

🍅 Bom TCC!
