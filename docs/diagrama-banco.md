# Diagrama Entidade-Relacionamento — Mark Fruit

Estrutura do banco de dados PostgreSQL (Supabase). Os nomes apresentados
aqui estão **traduzidos para o português** para fins de documentação do
TCC; no banco real os nomes são em inglês (`profiles`, `posts`, `ratings`,
`messages`) por convenção técnica.

```mermaid
erDiagram
    PERFIS ||--o{ ANUNCIOS : "publica"
    PERFIS ||--o{ AVALIACOES : "faz"
    PERFIS ||--o{ MENSAGENS : "envia/recebe"
    ANUNCIOS ||--o{ AVALIACOES : "recebe"
    ANUNCIOS ||--o{ MENSAGENS : "originam"

    PERFIS {
        uuid id PK
        text nome
        text papel "CONSUMIDOR ou PRODUTOR"
        text telefone
        text cidade
        text estado
        text bio
        text avatar
        float latitude
        float longitude
        timestamp criado_em
    }

    ANUNCIOS {
        bigint id PK
        text titulo
        text descricao
        numeric preco
        text imagem
        text categoria
        bool e_semente
        int estoque
        uuid autor_id FK
        timestamp criado_em
    }

    AVALIACOES {
        bigint id PK
        bigint anuncio_id FK
        uuid usuario_id FK
        int estrelas
        text comentario
        timestamp criado_em
    }

    MENSAGENS {
        bigint id PK
        bigint anuncio_id FK
        uuid remetente_id FK
        uuid destinatario_id FK
        text conteudo
        bool lida
        timestamp criado_em
    }
```

## Descrição das entidades

| Português (TCC) | Tabela real | Conteúdo |
|-----------------|-------------|----------|
| **Perfis** | `profiles` | Dados estendidos dos usuários (estende `auth.users`). |
| **Anúncios** | `posts` | Produtos publicados pelos produtores. |
| **Avaliações** | `ratings` | Notas de 1 a 5 com comentário (uma por usuário/anúncio). |
| **Mensagens** | `messages` | Conversas em tempo real consumidor ↔ produtor. |

## Relacionamentos

- Um **Perfil** publica vários **Anúncios** (1:N).
- Um **Anúncio** recebe várias **Avaliações** (1:N), e cada usuário só
  avalia uma vez (chave única composta `(anuncio_id, usuario_id)`).
- **Mensagens** ligam dois Perfis (remetente e destinatário) a respeito
  de um Anúncio.

## Como gerar a imagem para o TCC

Abra `docs/diagrama-banco.html` no navegador (basta dar duplo clique no
arquivo) — o diagrama é renderizado com fundo branco e tamanho ideal
para captura de tela.
