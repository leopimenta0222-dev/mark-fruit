# Roteiro completo de apresentação — Mark Fruit

Este documento serve como guia de estudo, roteiro de fala e plano de recuperação para a apresentação do TCC. A demonstração principal dura entre **8 e 10 minutos**. Se a banca der mais tempo, use a seção técnica e as respostas preparadas no final.

## 1. Resumo para decorar

> O Mark Fruit é um marketplace de hortifruti que aproxima consumidores de produtores locais. O consumidor encontra frutas, verduras, plantas e sementes, conversa com o produtor e registra um pedido para entrega ou retirada. O produtor anuncia seus produtos, recebe pedidos e atualiza o andamento. O site foi feito em React, publicado na Vercel e conectado ao Supabase para autenticação, banco de dados, imagens, segurança e chat em tempo real.

Se alguém da equipe esquecer a fala, basta voltar a esta ideia: **aproximar quem produz de quem quer comprar produtos locais**.

## 2. O que está pronto

- Site publicado e acessível em `https://mark-fruit.vercel.app/`.
- Interface responsiva para computador, tablet e celular.
- Tema claro e tema escuro, com preferência salva no navegador.
- Cadastro e login de consumidor e produtor.
- Proteção de páginas que exigem login e de páginas exclusivas do produtor.
- Perfil editável com cidade, estado, telefone, apresentação e localização.
- Página inicial com categorias, busca, recomendações, avaliações e proximidade.
- Detalhes de produto com preço, estoque, quantidade, produtor e avaliações.
- Carrinho persistente no navegador, alteração de quantidade e separação por produtor.
- Checkout acadêmico com retirada ou entrega.
- Pix e cartão demonstrativos, sem cobrança real.
- Criação segura de pedidos no banco e controle de estoque.
- Histórico do consumidor e painel de pedidos recebidos pelo produtor.
- Quatro etapas de pedido: recebido, em preparação, pronto ou enviado e concluído.
- Chat entre consumidor e produtor com atualização em tempo real.
- Cadastro de anúncios pelo produtor e armazenamento de imagens.
- Avaliação de produtos.
- PlantaBot com orientações de cultivo e ligação com a venda de sementes.
- Página de erro para endereço inexistente.
- 39 testes automatizados aprovados.
- Dois conjuntos de 20 capturas: tema claro e tema escuro.

## 3. O que ainda é limitação ou trabalho futuro

Apresente estes itens com segurança. Eles não significam que o projeto está incompleto; mostram que a equipe conhece o limite do protótipo e sabe como evoluí-lo.

- **Pagamento:** é uma simulação acadêmica. O sistema não recebe cartão, Pix nem dinheiro real.
- **Entrega:** o endereço é registrado, mas ainda não existe rastreamento por mapa ou integração com transportadora.
- **Notificações:** o usuário vê atualizações ao entrar no site; notificações por e-mail, SMS ou celular ficam como evolução.
- **PlantaBot:** usa uma base local de conhecimento e respostas preparadas. Ele não é uma inteligência artificial generativa e não deve ser apresentado como se fosse.
- **Localização:** depende da autorização do navegador e serve para ordenar produtos próximos; não calcula rota de entrega.
- **Operação comercial:** taxas, repasses, nota fiscal, disputa, estorno e moderação avançada não fazem parte do escopo do TCC.
- **Escala:** a arquitetura permite evolução, mas o ambiente atual é demonstrativo e utiliza contas e pedidos de teste.

Frase recomendada:

> Nós priorizamos um fluxo funcional e seguro de marketplace. Pagamento real, logística e notificações foram deixados como evoluções porque exigem integrações comerciais e validações que ultrapassam o escopo acadêmico deste trabalho.

## 4. Divisão sugerida entre quatro integrantes

Não é obrigatório seguir esta divisão. O objetivo é evitar troca de pessoa no meio de uma mesma ideia.

1. **Integrante 1 — problema e proposta:** abertura, público, objetivo e página inicial.
2. **Integrante 2 — jornada do consumidor:** busca, produto, carrinho, checkout e pedidos.
3. **Integrante 3 — solução técnica:** React, Vercel, Supabase, autenticação, segurança e tempo real.
4. **Integrante 4 — jornada do produtor:** pedidos recebidos, atualização de status, anúncio, limitações e encerramento.

Cada integrante deve saber o resumo da seção 1 para conseguir continuar caso outra pessoa se perca.

## 5. Preparação antes da apresentação

### Um dia antes

- Carregar completamente o tablet e levar o carregador.
- Testar o site no mesmo navegador que será usado na apresentação.
- Testar a internet do local e preparar um ponto de acesso pelo celular.
- Confirmar que as contas demonstrativas entram normalmente.
- Confirmar que existe pelo menos um pedido em andamento.
- Deixar a senha demonstrativa anotada fora do slide, do Git e dos prints.
- Baixar os dois arquivos ZIP de capturas para uso sem internet.
- Desativar notificações pessoais do tablet.
- Ensaiar o fluxo completo duas vezes com cronômetro.

### Trinta minutos antes

- Abrir o site e conferir se os produtos carregaram.
- Usar o tablet em modo paisagem.
- Ativar o tema escolhido para a apresentação.
- Fechar abas pessoais e aplicativos desnecessários.
- Aumentar o brilho e conferir o volume, caso a apresentação tenha vídeo.
- Manter abertas somente a página inicial e a pasta de prints.
- Não deixar a senha visível para a banca.

## 6. Fala completa, passo a passo

### Etapa 1 — abertura e problema, 40 segundos

**Tela:** página inicial.

**Ação:** deixe a página parada no início, sem rolar imediatamente.

**Fala sugerida:**

> Bom dia. Nosso projeto se chama Mark Fruit. Ele foi criado para aproximar pequenos produtores e consumidores interessados em produtos locais. Muitas vezes o produtor tem dificuldade para divulgar o que está disponível, enquanto o consumidor não sabe quem produz perto dele. O Mark Fruit reúne essas duas pontas em um marketplace de frutas, verduras, plantas e sementes.

**O que destacar:** nome, proposta “direto do produtor”, categorias e aparência adaptada ao tablet.

### Etapa 2 — página inicial, 45 segundos

**Tela:** `01-home.png`.

**Ação:** role um pouco e mostre as prateleiras de produtos.

**Fala sugerida:**

> A página inicial apresenta as categorias e organiza os produtos de formas diferentes. Temos os melhores para o usuário, produtos próximos, mais bem avaliados, novidades e separação por categoria. Quando o usuário permite a localização, a distância ajuda na ordenação. Também mantivemos acesso rápido ao carrinho, ao tema e às funções principais.

**Detalhe técnico se perguntarem:** a proximidade é estimada pela distância entre as coordenadas do perfil e do produtor. Não é uma rota de entrega.

### Etapa 3 — busca e categorias, 30 segundos

**Tela:** `02-busca.png`.

**Ação:** pesquise por “morango” ou toque na categoria Frutas.

**Fala sugerida:**

> O consumidor pode pesquisar pelo nome do produto ou navegar por categoria. O filtro reduz a lista sem exigir que ele conheça um produtor específico. Isso melhora a descoberta de produtos locais.

### Etapa 4 — cadastro e login, 45 segundos

**Telas:** `03-login.png` e `04-cadastro.png`.

**Ação:** mostre rapidamente o cadastro e depois entre com a conta de consumidor.

**Fala sugerida:**

> O sistema possui dois tipos de conta: consumidor e produtor. A autenticação é feita pelo Supabase Auth. O site também protege as rotas: páginas de perfil, checkout, pedidos e chat exigem login, e anunciar ou gerenciar vendas exige uma conta de produtor.

**Não faça:** não crie uma conta nova ao vivo, pois confirmação de e-mail ou internet lenta pode consumir tempo.

### Etapa 5 — detalhe do produto, 50 segundos

**Tela:** `05-produto.png`.

**Ação:** abra o Morango orgânico 500g.

**Fala sugerida:**

> Nesta tela aparecem a imagem, a descrição, o preço, o estoque, a avaliação e a identificação do produtor. O consumidor escolhe a quantidade, pode adicionar ao carrinho, comprar diretamente ou iniciar uma conversa. As avaliações ajudam a criar confiança entre os participantes.

**O que explicar:** o preço exibido na tela não é aceito cegamente no checkout; o banco valida os produtos e calcula os valores ao registrar o pedido.

### Etapa 6 — carrinho, 45 segundos

**Telas:** `07-carrinho-vazio.png` e `09-carrinho-preenchido.png`.

**Ação:** adicione o produto, abra o carrinho e altere a quantidade uma vez.

**Fala sugerida:**

> O carrinho permite aumentar, reduzir e remover itens. Ele fica salvo no navegador, então não desaparece ao atualizar a página. Quando existem produtos de produtores diferentes, o carrinho os separa por produtor, preparando a criação correta dos pedidos.

**Detalhe importante:** o visitante pode montar o carrinho sem entrar, mas precisa fazer login para concluir.

### Etapa 7 — checkout, 1 minuto

**Telas:** `10-checkout-retirada.png`, `11-checkout-entrega.png` e `12-confirmacao.png`.

**Ação:** mostre primeiro retirada, depois entrega e os campos de endereço. Finalize apenas se a equipe quiser criar um novo pedido demonstrativo.

**Fala sugerida:**

> Na finalização, o consumidor escolhe retirada ou entrega. Na retirada, local e horário são combinados com o produtor. Na entrega, o endereço é obrigatório. O pagamento por Pix ou cartão é claramente identificado como demonstrativo, então nenhum valor ou dado bancário real é utilizado. Ao confirmar, uma função no banco valida usuário, produtos, estoque e preço antes de criar o pedido.

**Segurança para explicar:** cada tentativa usa um identificador próprio para evitar a duplicação acidental do mesmo checkout.

### Etapa 8 — pedidos do consumidor, 55 segundos

**Telas:** `13-pedidos-consumidor.png` e `14-detalhe-pedido.png`.

**Ação:** abra Meus pedidos e entre no pedido demonstrativo.

**Fala sugerida:**

> Depois da confirmação, o consumidor acompanha o histórico e o andamento. O pedido passa por quatro etapas: recebido, em preparação, pronto ou enviado e concluído. No detalhe aparecem itens, quantidades, total, produtor, forma de recebimento e a indicação de pagamento simulado.

**O que destacar:** comprador e produtor enxergam o mesmo status salvo no Supabase, mas cada um vê apenas os pedidos permitidos para sua conta.

### Etapa 9 — conversas e chat, 45 segundos

**Telas:** `15-conversas.png` e `16-chat.png`.

**Ação:** abra a conversa, mas não precisa enviar mensagem durante a banca.

**Fala sugerida:**

> O chat permite combinar retirada, tirar dúvidas e conversar sobre o produto. As mensagens ficam no banco e o Supabase Realtime entrega novas mensagens sem precisar atualizar manualmente a página. A lista de conversas é organizada por produto e participante.

### Etapa 10 — Como Plantar, 45 segundos

**Tela:** `06-como-plantar.png`.

**Ação:** toque em uma sugestão, como tomate ou alface.

**Fala sugerida:**

> A seção Como Plantar amplia a proposta do marketplace. O PlantaBot responde dúvidas de cultivo sobre clima, solo, plantio, rega e colheita. Ao lado, o usuário também encontra sementes anunciadas pelos produtores. Nesta versão, o bot usa uma base de conhecimento preparada pela equipe e funciona no próprio frontend.

**Se perguntarem se é IA:** responda que é um assistente baseado em regras e conteúdo estruturado, não um modelo generativo.

### Etapa 11 — perfil do consumidor, 30 segundos

**Tela:** `08-perfil-consumidor.png`.

**Ação:** mostre os dados, mas evite editar durante a apresentação.

**Fala sugerida:**

> O consumidor pode manter nome, telefone, cidade, estado e localização. A localização é opcional e ajuda a priorizar produtores próximos. Os dados ficam associados à conta autenticada.

### Etapa 12 — trocar para produtor, 25 segundos

**Ação:** saia da conta de consumidor e entre com a conta demonstrativa de produtor.

**Fala sugerida durante a troca:**

> Agora vamos mostrar a outra ponta do marketplace: a rotina de quem produz e vende.

### Etapa 13 — perfil do produtor, 30 segundos

**Tela:** `17-perfil-produtor.png`.

**Fala sugerida:**

> O perfil do produtor apresenta sua identificação, região e uma descrição da produção. Isso dá contexto e proximidade para o consumidor, em vez de mostrar apenas um catálogo sem origem.

### Etapa 14 — novo anúncio, 45 segundos

**Tela:** `18-novo-anuncio.png`.

**Ação:** abra Anunciar e percorra os campos sem enviar um produto novo.

**Fala sugerida:**

> Somente produtores podem acessar esta tela. O anúncio possui título, descrição, preço, categoria, estoque e imagem. A imagem pode ser enviada ao Supabase Storage, enquanto os dados do produto são armazenados no PostgreSQL.

### Etapa 15 — pedidos recebidos, 1 minuto

**Tela:** `19-pedidos-recebidos.png`.

**Ação:** mostre o pedido e avance apenas uma etapa previamente combinada pela equipe.

**Fala sugerida:**

> O produtor recebe os pedidos relacionados aos próprios produtos. Ele visualiza consumidor, itens, total e situação. A partir daqui atualiza o pedido para em preparação, pronto ou enviado e concluído. A atualização é feita no banco e fica disponível também para o consumidor.

**Cuidado:** não avance várias vezes o único pedido de demonstração. Deixe uma etapa disponível para mostrar ao vivo.

### Etapa 16 — tema e responsividade, 25 segundos

**Ação:** alterne uma vez entre claro e escuro.

**Fala sugerida:**

> A interface possui temas claro e escuro e salva a preferência no navegador. Também foi revisada para tablet, com alvos de toque maiores e uma barra inferior que facilita o uso durante a apresentação.

### Etapa 17 — arquitetura técnica, 1 minuto

Use esta explicação sem abrir código:

```text
Tablet ou computador
        ↓
React + Vite, hospedados na Vercel
        ↓
Supabase
├── Auth: cadastro, login e sessão
├── PostgreSQL: perfis, produtos, avaliações, mensagens e pedidos
├── RLS: regras de acesso por usuário
├── Realtime: atualização do chat
└── Storage: imagens dos anúncios
```

**Fala sugerida:**

> O frontend foi desenvolvido em React com Vite e está hospedado na Vercel. Ele conversa diretamente com o Supabase, que fornece autenticação, banco PostgreSQL, armazenamento e tempo real. As regras de Row Level Security controlam o acesso aos dados. Para operações sensíveis, como criar o checkout e avançar o pedido, usamos funções no banco para centralizar validações e reduzir inconsistências.

### Etapa 18 — encerramento, 35 segundos

**Fala sugerida:**

> Como resultado, entregamos um fluxo completo entre consumidor e produtor: descoberta, contato, carrinho, pedido e acompanhamento. O Mark Fruit demonstra como a tecnologia pode dar mais visibilidade ao produtor local e facilitar o acesso do consumidor a produtos da região. Como próximas evoluções, consideramos pagamento real, logística, notificações e ampliação da base do PlantaBot. Obrigado. Estamos à disposição para perguntas.

## 7. Explicação das 20 capturas

| Nº | Tela | O que comprova | Frase curta para usar |
|---:|---|---|---|
| 01 | Página inicial | Proposta, categorias e experiência geral | “Esta é a entrada do marketplace e organiza a descoberta de produtos.” |
| 02 | Busca | Filtro por texto | “O usuário encontra rapidamente o que procura.” |
| 03 | Login | Autenticação | “O Supabase Auth controla a entrada e a sessão.” |
| 04 | Cadastro | Dois tipos de participante | “Consumidor e produtor entram no mesmo ecossistema com permissões diferentes.” |
| 05 | Produto | Preço, estoque, produtor e ações | “Aqui o consumidor decide quantidade, compra, conversa ou avalia.” |
| 06 | Como Plantar | Conteúdo educativo e sementes | “O projeto também ajuda quem quer começar a cultivar.” |
| 07 | Carrinho vazio | Estado vazio orientado | “Mesmo sem itens, a tela indica o próximo passo.” |
| 08 | Perfil do consumidor | Dados e localização | “A localização opcional melhora a recomendação por proximidade.” |
| 09 | Carrinho preenchido | Quantidades, total e produtor | “O carrinho persiste e organiza itens por produtor.” |
| 10 | Checkout com retirada | Forma de recebimento | “Na retirada, consumidor e produtor combinam local e horário.” |
| 11 | Checkout com entrega | Validação do endereço | “Na entrega, o endereço completo passa a ser obrigatório.” |
| 12 | Confirmação | Conclusão da jornada | “O pedido foi registrado e pode ser acompanhado.” |
| 13 | Pedidos do consumidor | Histórico | “O consumidor vê apenas as compras ligadas à própria conta.” |
| 14 | Detalhe do pedido | Status, itens e total | “As quatro etapas deixam o andamento transparente.” |
| 15 | Conversas | Organização do contato | “As conversas são agrupadas por produto e participante.” |
| 16 | Chat | Comunicação em tempo real | “Novas mensagens aparecem sem atualizar a página.” |
| 17 | Perfil do produtor | Identidade e origem | “O consumidor sabe de quem está comprando e de qual região.” |
| 18 | Novo anúncio | Gestão de catálogo | “Somente o produtor pode cadastrar produtos.” |
| 19 | Pedidos recebidos | Operação da venda | “O produtor prepara e atualiza o mesmo pedido visto pelo consumidor.” |
| 20 | Página não encontrada | Tratamento de erro | “Endereços inválidos não deixam o usuário sem orientação.” |

## 8. Perguntas prováveis da banca

### “Por que escolheram esse problema?”

> Porque existe uma distância de informação entre produtores locais e consumidores. O produtor precisa de visibilidade e o consumidor precisa encontrar oferta, origem e contato de forma simples.

### “Quem é o público-alvo?”

> Pequenos produtores de hortifruti e consumidores interessados em comprar frutas, verduras, plantas e sementes diretamente de produtores da região.

### “Por que React?”

> React facilita a construção de uma interface dividida em componentes, o reaproveitamento de elementos e a atualização dinâmica de carrinho, sessão, chat e pedidos.

### “Por que Supabase?”

> Porque reúne PostgreSQL, autenticação, armazenamento, tempo real e políticas de segurança. Isso permitiu concentrar o esforço no produto sem construir e manter um servidor próprio para cada serviço.

### “Onde está o backend?”

> O projeto usa o Supabase como Backend as a Service. O frontend acessa as APIs do Supabase, e as operações críticas ficam em funções PostgreSQL protegidas pelas regras do banco.

### “Como vocês protegem os dados?”

> Usamos autenticação e Row Level Security. As políticas relacionam a pessoa autenticada aos dados que ela pode consultar ou alterar. Uma chave privilegiada não fica exposta no frontend.

### “Um consumidor consegue entrar na área do produtor?”

> Não pelo fluxo da aplicação. As rotas exclusivas verificam o papel do usuário, e as regras do banco também precisam impedir acesso indevido aos dados.

### “Como evitam preço falso enviado pelo navegador?”

> No checkout, os produtos e os preços são consultados novamente no banco. O total é calculado na operação segura, em vez de confiar apenas no valor mostrado pelo frontend.

### “Como evitam pedido duplicado?”

> Cada tentativa de checkout recebe um identificador único. Repetir acidentalmente a mesma tentativa não deve gerar várias compras iguais.

### “O estoque é real?”

> É um estoque demonstrativo salvo no banco e validado durante o checkout. Ele representa a lógica necessária, embora o ambiente não esteja ligado a uma operação comercial real.

### “O pagamento funciona de verdade?”

> Não. Pix e cartão são simulações acadêmicas claramente identificadas. Não coletamos dados bancários nem cobramos valores.

### “O chat é em tempo real?”

> Sim. As mensagens são persistidas e o Supabase Realtime comunica novas mensagens enquanto a conversa está aberta.

### “O PlantaBot usa inteligência artificial?”

> Nesta versão, não usa um modelo generativo. É um assistente baseado em regras e em uma base estruturada de conhecimentos de cultivo. Uma evolução seria integrar um modelo com fontes agrícolas revisadas.

### “Por que existe página de erro?”

> Porque um sistema completo também precisa tratar caminhos inválidos e orientar o usuário de volta à navegação, em vez de mostrar uma tela quebrada.

### “O que vocês fariam com mais tempo?”

> Integraríamos pagamento real, cálculo e rastreamento de entrega, notificações, moderação, recuperação de senha, métricas para produtores e uma base de conhecimento agrícola maior.

### “Como vocês testaram?”

> O frontend possui 39 testes automatizados. Também verificamos o fluxo conectado ao Supabase, a versão publicada e a responsividade em tamanhos de tablet horizontal e vertical.

## 9. O que não dizer

- Não diga que o pagamento é real.
- Não diga que o PlantaBot é uma IA generativa.
- Não diga que a distância representa uma rota exata.
- Não diga que o sistema está pronto para uma operação financeira em produção.
- Não diga que qualquer usuário pode ver todos os pedidos.
- Não prometa funções que não aparecem no sistema.

Prefira: **“protótipo funcional conectado a serviços reais, com integrações comerciais futuras”**.

## 10. Plano B para imprevistos

### Se a internet cair

1. Abra a pasta de capturas.
2. Mostre as imagens na ordem 01 a 20.
3. Use a coluna “Frase curta” da seção 7.
4. Explique que os dados normalmente vêm do Supabase, mas a demonstração está sendo feita pelas evidências preparadas.

### Se o login falhar

- Confira o e-mail e a senha demonstrativa.
- Atualize a página apenas uma vez.
- Se não voltar, use os prints 08 a 19 para continuar sem interromper a fala.

### Se o pedido já estiver concluído

- Mostre o pedido concluído como prova do fluxo.
- Use o print 19 para explicar o botão de avanço.
- Não tente criar vários pedidos sob pressão.

### Se o tablet mudar para o modo retrato

- Continue normalmente; a interface foi validada em retrato.
- Para aproveitar melhor a largura durante a banca, volte ao modo paisagem quando for conveniente.

### Se alguém esquecer a fala

Use esta frase de retorno:

> Voltando ao objetivo principal, esta função aproxima o consumidor do produtor e mantém a informação registrada no Supabase.

## 11. Checklist final de aprovação

- [ ] Todos sabem explicar o problema em uma frase.
- [ ] Todos sabem diferenciar consumidor e produtor.
- [ ] A equipe sabe dizer que o pagamento é simulado.
- [ ] A equipe sabe dizer que o PlantaBot é baseado em regras.
- [ ] Uma pessoa controla o tablet enquanto outra fala.
- [ ] A troca entre as contas foi ensaiada.
- [ ] Existe um pedido em andamento para demonstrar.
- [ ] Os arquivos ZIP claro e escuro estão disponíveis offline.
- [ ] O link público foi testado no dia.
- [ ] O tempo total ficou abaixo do limite da banca.

