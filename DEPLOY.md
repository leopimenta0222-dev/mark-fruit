# 🚀 Guia de Deploy — Mark Fruit

Hospedagem: **Vercel** (frontend) + **Render** (backend + PostgreSQL).
Tudo no plano gratuito. Siga os passos na ordem.

> ⚠️ **Você precisa fazer login/criar conta** nos sites abaixo — por segurança,
> isso tem que ser feito por você. O guia mostra exatamente o que clicar.

---

## Visão geral do que vamos fazer

```
1. Subir o código pro GitHub
2. Render → criar banco PostgreSQL
3. Render → criar o backend (API)
4. Popular o banco com os produtos (seed)
5. Vercel → criar o frontend (site)
6. Conectar os dois (variáveis de ambiente)
```

---

## Passo 1 — Subir o código pro GitHub

O repositório git **já está criado e com o primeiro commit feito**. Falta só
enviar pro GitHub.

1. Acesse https://github.com/new
2. **Repository name:** `mark-fruit` (ou o nome que quiser)
3. Deixe **público** ou **privado**, tanto faz
4. **NÃO** marque "Add a README" / "Add .gitignore" (o repo já tem)
5. Clique em **Create repository**
6. O GitHub vai mostrar uma URL tipo `https://github.com/SEU_USUARIO/mark-fruit.git`
7. No terminal, dentro da pasta do projeto, rode:

```powershell
git remote add origin https://github.com/SEU_USUARIO/mark-fruit.git
git push -u origin main
```

✅ Pronto. Atualize a página do GitHub e o código vai estar lá.

---

## Passo 2 — Criar o banco PostgreSQL no Render

1. Acesse https://render.com e faça login (dá pra entrar com a conta do GitHub)
2. No painel, clique em **New +** → **PostgreSQL**
3. Preencha:
   - **Name:** `markfruit-db`
   - **Region:** Oregon (US West) — ou a mais próxima
   - **Plan:** **Free**
4. Clique em **Create Database**
5. Espere ~1 min até o status virar **Available**
6. Na página do banco, procure a seção **Connections** e copie:
   - **Internal Database URL** → vamos usar no backend do Render
   - **External Database URL** → vamos usar pra popular o banco do seu PC

---

## Passo 3 — Criar o backend (API) no Render

1. No Render: **New +** → **Web Service**
2. Conecte sua conta do GitHub e escolha o repositório `mark-fruit`
3. Preencha:
   - **Name:** `markfruit-api`
   - **Region:** a mesma do banco
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** **Free**
4. Em **Environment Variables**, adicione:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | cole a **Internal Database URL** do Passo 2 |
   | `JWT_SECRET` | uma frase longa e aleatória (ex: `markfruit-tcc-2026-xyz...`) |
   | `FRONTEND_URL` | deixe **vazio por enquanto** — preenchemos no Passo 6 |
5. Clique em **Create Web Service**
6. O Render vai instalar, rodar as migrations e subir a API (~3-5 min)
7. Quando terminar, ele te dá uma URL tipo `https://markfruit-api.onrender.com`
   — **anote essa URL**, vamos precisar dela.
8. Teste: abra a URL no navegador, deve aparecer `{"ok":true,"service":"Mark Fruit API"}`

> 💡 **Atalho:** em vez dos passos 2 e 3 manuais, você pode usar **New + → Blueprint**
> e escolher o repositório — o arquivo `render.yaml` já cria o banco + a API juntos.
> Ainda assim você precisa preencher `FRONTEND_URL` depois.

---

## Passo 4 — Popular o banco com os produtos

O banco subiu vazio. Vamos rodar o seed (os 54 produtos de exemplo) a partir do seu PC.

1. Abra o arquivo `backend/.env` no VS Code
2. Na linha `DATABASE_URL`, cole a **External Database URL** do Passo 2:
   ```
   DATABASE_URL="postgresql://...sua url externa aqui..."
   ```
3. No terminal:
   ```powershell
   cd backend
   npx prisma migrate deploy
   npm run seed
   ```
4. Deve aparecer `✅ 54 produtos criados com fotos reais do Unsplash!`

> O seed só precisa rodar **uma vez**. Os dados ficam salvos no PostgreSQL pra sempre.

---

## Passo 5 — Criar o frontend (site) na Vercel

1. Acesse https://vercel.com e faça login (pode usar a conta do GitHub)
2. Clique em **Add New...** → **Project**
3. Escolha o repositório `mark-fruit` → **Import**
4. Configure:
   - **Framework Preset:** Vite (deve detectar sozinho)
   - **Root Directory:** clique em **Edit** e selecione `frontend`
5. Abra **Environment Variables** e adicione:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | a URL do backend do Render (ex: `https://markfruit-api.onrender.com`) |
6. Clique em **Deploy**
7. Em ~1-2 min o site sobe. A Vercel te dá uma URL tipo
   `https://mark-fruit.vercel.app` — **anote**.

---

## Passo 6 — Conectar os dois (liberar o CORS)

Falta o backend "confiar" no endereço do site.

1. Volte no Render → serviço `markfruit-api` → aba **Environment**
2. Edite a variável `FRONTEND_URL` e coloque a URL da Vercel:
   ```
   https://mark-fruit.vercel.app
   ```
3. Salve. O Render vai reiniciar o backend automaticamente (~1 min)

✅ **Pronto!** Abra a URL da Vercel e o Mark Fruit está no ar 🎉

---

## ⚠️ Coisas importantes pra saber

- **O backend free do Render "dorme"** depois de 15 min sem uso. A primeira
  visita depois disso demora ~30-50s pra carregar (ele está "acordando").
  Depois fica normal. Pra apresentação do TCC, abra o site 1 min antes.

- **Fotos enviadas pelos produtores** (no botão "Anunciar") ficam na pasta
  `uploads/` do servidor, que o Render free **apaga a cada novo deploy**. As
  54 fotos do seed não somem (são links do Unsplash). Se quiser uploads
  permanentes depois, dá pra plugar um serviço de storage (Cloudinary, S3).

- **Toda vez que você fizer mudança no código:** basta `git push` que o Render
  e a Vercel fazem o deploy automático sozinhos.

- **Logins de teste** (já vêm no seed, senha `123456`):
  - Consumidores: `ana@markfruit.com` / `pedro@markfruit.com`
  - Produtores: `joaquim@markfruit.com`, `maria@markfruit.com`, etc.

---

## 🆘 Se algo der errado

| Problema | Solução |
|----------|---------|
| Site abre mas não carrega produtos | Confira se `VITE_API_URL` na Vercel está certo e sem `/` no final |
| Erro de CORS no console do navegador | Confira se `FRONTEND_URL` no Render bate exatamente com a URL da Vercel |
| Backend não sobe / erro de migration | Veja os **Logs** no Render. Geralmente é `DATABASE_URL` errada |
| Chat não conecta | O backend pode estar "dormindo" — espere 1 min e recarregue |
| `git push` pede senha | Use um Personal Access Token do GitHub em vez da senha |
