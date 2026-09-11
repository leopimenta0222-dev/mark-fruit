# Mark Fruit — Finalização para apresentação do TCC

**Data:** 11 de setembro de 2026  
**Prazo para prints:** até 4 dias  
**Prazo para apresentação:** 20 dias

## 1. Objetivo

Finalizar o Mark Fruit como um marketplace de hortifruti demonstrável em tablet, conectado ao Supabase e com um fluxo completo entre consumidor e produtor. A entrega deve priorizar telas prontas para a atividade de documentação nos primeiros quatro dias e, em seguida, estabilidade, segurança e preparação para a banca.

O fluxo principal termina em um pedido salvo no Supabase com pagamento simulado. Nenhuma cobrança real será realizada.

## 2. Escopo

### Incluído

- Cadastro e login de consumidores e produtores.
- Catálogo, busca, categorias e detalhes do produto.
- Perfil editável.
- Criação e exclusão de anúncios por produtores.
- Avaliações.
- Seção Como Plantar.
- Conversas e chat em tempo real.
- Carrinho persistido no dispositivo.
- Checkout com entrega ou retirada e pagamento simulado.
- Pedidos registrados no Supabase.
- Histórico de pedidos do consumidor.
- Pedidos recebidos e atualização de status pelo produtor.
- Interface responsiva para tablet nas orientações horizontal e vertical.
- Estados de carregamento, vazio, erro, sucesso e indisponibilidade de rede.
- Dados e contas de demonstração.

### Fora do escopo

- Cobrança real por cartão, Pix ou intermediador de pagamento.
- Cálculo real de frete ou integração com transportadoras.
- Cupons, programa de fidelidade, analytics ou painel administrativo avançado.
- Notificações push.
- Aplicativo nativo.

## 3. Fluxo principal da demonstração

1. O consumidor entra em uma conta de demonstração.
2. Pesquisa ou escolhe um produto no catálogo.
3. Abre o anúncio, define a quantidade e adiciona o produto ao carrinho.
4. Revisa o carrinho e inicia o checkout.
5. Escolhe entrega ou retirada e confere os dados necessários.
6. Seleciona uma forma de pagamento demonstrativa e confirma.
7. O sistema separa itens de produtores diferentes e cria um pedido para cada produtor.
8. O Supabase registra o pedido e seus itens.
9. O consumidor vê a confirmação e acompanha o pedido em Meus pedidos.
10. O produtor entra em sua conta, abre Pedidos recebidos e altera o status.
11. Consumidor e produtor podem continuar a negociação pelo chat existente.

## 4. Arquitetura

O frontend continuará em React 18 com Vite, React Router e Tailwind CSS. O Supabase continuará responsável por autenticação, PostgreSQL, armazenamento de imagens e mensagens em tempo real.

### Carrinho

- Um contexto React centralizará itens, quantidades, subtotal e contagem.
- O estado será persistido em `localStorage` para sobreviver a recarregamentos.
- Itens serão validados novamente antes da criação do pedido.
- O carrinho permitirá alterar quantidade, remover um item e esvaziar tudo.
- A interface informará quando um item estiver sem estoque ou indisponível.

### Pedidos

Serão adicionadas duas tabelas ao Supabase:

- `orders`: comprador, produtor, status, entrega/retirada, endereço, subtotal, total, forma e status do pagamento simulado e datas.
- `order_items`: pedido, produto, título e preço registrados no momento da compra, quantidade e subtotal.

Um carrinho pode conter produtos de vários produtores, mas cada pedido pertence a apenas um produtor. O checkout cria os pedidos correspondentes em uma única operação lógica e apresenta todos os números ao consumidor.

### Status

O pedido seguirá a sequência:

`RECEIVED` → `PREPARING` → `READY_OR_SHIPPED` → `COMPLETED`

O produtor pode avançar o pedido. Cancelamento não faz parte da demonstração inicial e só será incluído se os testes principais estiverem concluídos.

### Segurança

- RLS permanecerá ativado em todas as tabelas expostas.
- Consumidores poderão consultar apenas os próprios pedidos.
- Produtores poderão consultar apenas pedidos associados a eles.
- Somente o produtor do pedido poderá alterar seu status.
- Itens de pedidos seguirão a visibilidade do pedido correspondente.
- A criação validará a identidade do consumidor autenticado e o produtor dos produtos.
- Nenhuma chave privilegiada do Supabase será exposta no frontend.

## 5. Telas

### Telas existentes que serão refinadas

- Início.
- Resultados de busca e categoria.
- Login.
- Cadastro.
- Perfil do consumidor e perfil do produtor.
- Criar anúncio.
- Detalhes do produto.
- Como Plantar.
- Conversas.
- Chat.
- Página não encontrada.

### Novas telas

- Carrinho.
- Checkout simulado.
- Confirmação do pedido.
- Meus pedidos.
- Detalhes de um pedido.
- Pedidos recebidos pelo produtor.

## 6. Direção visual

A identidade será de uma **feira local contemporânea**: próxima, confiável e centrada em produtos e produtores. O site não deve parecer um template genérico de SaaS ou uma cópia de um grande marketplace.

### Paleta

- Verde folha `#246B3D`: marca e ações principais.
- Verde profundo `#173D28`: navegação e textos de destaque.
- Amarelo fruta `#F3C64E`: seleção, preço e confirmação.
- Vermelho goiaba `#B84B4B`: erros e alertas.
- Papel claro `#F7F6F0`: fundo principal.
- Grafite vegetal `#202A23`: texto principal.

### Tipografia e composição

- Títulos amigáveis e expressivos, com uma família de personalidade orgânica.
- Texto de interface altamente legível e com boa densidade em tablet.
- Conteúdo predominantemente alinhado à esquerda.
- Fotografias dos produtos serão o principal elemento visual.
- Prateleiras horizontais lembrarão a organização de uma banca de feira.
- Bordas, sombras, gradientes, badges e cartões serão usados somente quando explicarem hierarquia ou estado.
- Textos serão diretos, consistentes e escritos do ponto de vista do usuário.

### Elemento memorável

A página inicial terá uma abertura inspirada em uma banca de feira, com fotografia de hortifruti e uma chamada curta para explorar produtos locais. O restante da interface será mais contido para que esse elemento concentre a personalidade visual.

### Revisão contra aparência genérica

A primeira leitura do site atual se aproxima de um e-commerce genérico por usar gradiente promocional, muitos cartões arredondados, descontos simulados e selos com afirmações não verificadas. A revisão trocará esses elementos por fotografia real dos produtos, hierarquia tipográfica, espaçamento e linguagem contextual. Descontos falsos e afirmações como “sem agrotóxico” serão removidos quando não houver dado que as comprove.

## 7. Responsividade e acessibilidade

- O alvo principal é tablet, nas orientações horizontal e vertical.
- O catálogo usará duas ou três colunas conforme a largura disponível.
- A navegação não dependerá de hover e oferecerá alvos confortáveis para toque.
- Busca, carrinho, pedidos e perfil permanecerão acessíveis em larguras intermediárias.
- Formulários terão labels, erros próximos ao campo e foco visível.
- Cores terão contraste adequado e não serão o único indicador de estado.
- Animações serão limitadas a feedback de interação e respeitarão movimento reduzido.
- A interface continuará funcional em desktop e celular, embora o tablet seja o dispositivo de validação prioritário.

## 8. Estados e tratamento de falhas

Cada fluxo relevante deve ter estados de carregamento, vazio, erro, sucesso e botão desabilitado durante envio.

- Falha de rede: explicar que não foi possível acessar o serviço e oferecer nova tentativa.
- Sessão expirada: direcionar para login preservando, quando seguro, o caminho pretendido.
- Produto indisponível: impedir confirmação e orientar a atualizar o carrinho.
- Erro parcial ao criar pedidos: não limpar o carrinho silenciosamente; informar quais pedidos foram registrados e impedir duplicação.
- Lista vazia: apresentar uma ação útil, como explorar produtos ou criar o primeiro anúncio.
- Sucesso: confirmar exatamente a ação realizada e indicar o próximo passo.

## 9. Verificação

### Fluxos funcionais

- Cadastro, login, logout e restauração de sessão.
- Busca e filtro por categoria.
- Criação e exclusão de anúncio pelo produtor.
- Avaliação pelo consumidor.
- Carrinho persistido após atualizar a página.
- Alteração de quantidades e remoção de itens.
- Checkout com um e vários produtores.
- Registro correto de pedidos e itens no Supabase.
- Visibilidade correta para consumidor e produtor.
- Atualização sequencial de status.
- Chat em tempo real entre duas contas.

### Interface

- Tablet horizontal e vertical.
- Navegação por toque, teclado e foco visível.
- Textos sem corte e sem rolagem horizontal indevida.
- Imagens com proporção e alternativa de falha.
- Estados vazio, carregando, erro, sucesso e desabilitado.
- Build de produção sem erros.

### Segurança

- Um consumidor não consegue ler pedidos de outro consumidor.
- Um produtor não consegue ler ou alterar pedidos de outro produtor.
- Um usuário não consegue criar pedido em nome de outra pessoa.
- Um consumidor não consegue alterar o status do pedido.

## 10. Entrega para os prints — dias 1 a 4

### Dia 1

- Criar as estruturas de pedidos no Supabase.
- Implementar o estado persistente do carrinho.
- Adicionar acesso ao carrinho na navegação.

### Dia 2

- Implementar checkout simulado.
- Registrar pedidos e itens no Supabase.
- Criar confirmação de pedido.

### Dia 3

- Implementar Meus pedidos.
- Implementar Pedidos recebidos.
- Implementar mudança de status e detalhes do pedido.

### Dia 4

- Aplicar a direção visual nas telas existentes e novas.
- Revisar a interface no tablet horizontal e vertical.
- Preparar dados consistentes de demonstração.
- Capturar todas as telas necessárias para a atividade.

Os prints devem cobrir início, busca, login, cadastro, perfis, novo anúncio, detalhes do produto, Como Plantar, conversas, chat, carrinho vazio e preenchido, checkout, confirmação, Meus pedidos, detalhes do pedido e Pedidos recebidos.

## 11. Finalização — dias 5 a 20

- Corrigir problemas descobertos na entrega rápida.
- Completar estados de erro, vazio e carregamento.
- Validar RLS e demais regras do Supabase.
- Melhorar carregamento e dividir o pacote JavaScript quando trouxer benefício perceptível.
- Testar o fluxo completo repetidas vezes com contas de consumidor e produtor.
- Preparar uma versão de produção estável.
- Montar um roteiro curto de demonstração e ensaiar no tablet real.
- Manter os últimos dias como margem para falhas de rede, dispositivo ou configuração.

## 12. Critérios de conclusão

O projeto estará pronto quando:

1. Todas as telas listadas estiverem navegáveis e apresentáveis em tablet.
2. O fluxo consumidor → carrinho → checkout → pedido funcionar conectado ao Supabase.
3. O produtor visualizar e atualizar somente seus pedidos.
4. Login, anúncios, avaliações e chat continuarem funcionando.
5. Nenhuma tela principal exibir função obrigatória como “em desenvolvimento”.
6. O build de produção passar sem erros.
7. Os prints da atividade estiverem capturados até o quarto dia.
8. O fluxo da banca tiver sido ensaiado no tablet com dados de demonstração.
