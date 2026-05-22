# Mark Fruit

Marketplace nichado para hortifruti — frutas, verduras, plantas e sementes direto do produtor para o consumidor.

> **TCC** — Maria, Maria, Luiza e Yago

---

## Funcionalidades

### Consumidor
- Cadastro e login
- Perfil editável
- Tela inicial com busca e melhores anúncios (avaliação + proximidade)
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

## Tecnologias

| Camada | Tecnologia |
| ------ | ---------- |
| Linguagem | JavaScript (ES6+), JSX, HTML5, CSS3, SQL |
| Frontend | React 18 · Vite · TailwindCSS · React Router |
| Backend / API | **Supabase** (BaaS) |
| Banco de dados | PostgreSQL (gerenciado pelo Supabase) |
| Autenticação | Supabase Auth |
| Segurança | Row Level Security (RLS) |
| Tempo real | Supabase Realtime (chat) |
| Armazenamento | Supabase Storage (imagens dos anúncios) |
| Hospedagem | Vercel (frontend) |

O sistema **não tem servidor próprio**: o site (React) conversa direto com a API
do Supabase, que cuida do banco, autenticação, tempo real e armazenamento.

---

## Estrutura

```
mark-fruit/
├── frontend/                 # aplicação React (Vite)
│   ├── public/products/      # imagens dos produtos (locais)
│   └── src/
│       ├── components/       # Navbar, PostCard, Stars, Shelf...
│       ├── context/          # AuthContext (Supabase Auth)
│       ├── data/             # plantBot (bot "Como Plantar")
│       ├── pages/            # Home, Login, Register, PostDetail, Chat...
│       └── services/
│           ├── supabase.js   # cliente Supabase
│           └── db.js         # queries (posts, ratings, chat...)
└── supabase/
    ├── schema.sql            # tabelas + RLS + storage + realtime
    └── seed.mjs              # popula produtos e usuários de teste
```

---

## Como rodar localmente

Pré-requisitos: Node.js e um projeto no Supabase.

### 1. Configurar o banco (uma vez)
1. Crie um projeto em https://supabase.com
2. No **SQL Editor**, rode todo o conteúdo de `supabase/schema.sql`
3. Em **Authentication > Providers > Email**, desative "Confirm email"
4. Popule os dados:
   ```bash
   cd supabase
   npm install
   # crie supabase/.env (veja .env.example) com URL e service_role key
   npm run seed
   ```

### 2. Configurar e rodar o frontend
```bash
cd frontend
npm install
# crie frontend/.env (veja .env.example) com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm run dev
```
Abra http://localhost:5173

No VS Code também dá pra usar `Ctrl+Shift+B` ("Mark Fruit: Rodar site").

### Logins de teste (senha: 123456)
- Consumidores: `ana@markfruit.com` / `pedro@markfruit.com`
- Produtores: `joaquim@markfruit.com`, `maria@markfruit.com`, etc.

---

## Deploy (Vercel)

1. Importe o repositório na https://vercel.com
2. **Root Directory:** `frontend`
3. **Environment Variables:** `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
4. Deploy. As imagens e o site são servidos pela Vercel; os dados vêm do Supabase.
