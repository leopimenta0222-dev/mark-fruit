# Checklist de telas do Mark Fruit

Captura padrão: **1024 × 768 px**, tema claro, sem barras ou avisos do navegador. As imagens ficam em `docs/tcc/prints`.

- [x] 01 — Página inicial
- [x] 02 — Busca por produto
- [x] 03 — Login
- [x] 04 — Cadastro
- [x] 05 — Detalhe de produto
- [x] 06 — Como plantar
- [x] 07 — Carrinho vazio
- [x] 08 — Perfil do consumidor
- [x] 09 — Carrinho preenchido
- [x] 10 — Checkout com retirada
- [x] 11 — Checkout com entrega
- [x] 12 — Confirmação acadêmica
- [x] 13 — Pedidos do consumidor
- [x] 14 — Detalhe e andamento do pedido
- [x] 15 — Lista de conversas
- [x] 16 — Chat com o produtor
- [x] 17 — Perfil do produtor
- [x] 18 — Novo anúncio
- [x] 19 — Pedidos recebidos pelo produtor
- [x] 20 — Página não encontrada

## Conferência antes de entregar

- [x] Nenhum print está em estado de carregamento.
- [x] Não há informação pessoal real, senha ou chave de acesso visível.
- [x] Cabeçalhos, botões e textos importantes não estão cortados.
- [x] O pedido demonstrativo aparece para consumidor e produtor.
- [x] A indicação de pagamento simulado está legível.
- [x] Todas as imagens usam a mesma dimensão e o mesmo tema.

## Como recapturar

Mantenha o frontend local aberto, defina a senha demonstrativa somente na sessão do terminal e execute `node scripts/capture-tcc-screenshots.cjs`. O script não grava a senha no projeto.
