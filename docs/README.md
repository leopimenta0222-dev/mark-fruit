# Diagramas — Mark Fruit

Esta pasta contém os diagramas necessários para a documentação do TCC.

## Diagramas em PlantUML (UML padrão acadêmico)

Os arquivos `.puml` contêm código em PlantUML que gera diagramas em UML
padrão (com bonequinhos de palitinho para atores, elipses para casos de
uso, etc.) — formato esperado pela banca.

### Como gerar a imagem

1. Abra o arquivo `.puml` no VS Code (ou Bloco de Notas) e **copie todo o conteúdo**
2. Acesse **https://www.plantuml.com/plantuml/uml/** (ou https://www.planttext.com/)
3. **Apague** o exemplo padrão do site e **cole** o código
4. No PlantUML: clique em **Submit**. No PlantText: o diagrama aparece automático ao lado.
5. Clique com o **botão direito** na imagem gerada → **"Salvar imagem como..."** (escolha PNG ou SVG)
6. Cole no Word/Google Docs do TCC

### Arquivos disponíveis

| Arquivo | Diagrama | O que mostra |
|---------|----------|--------------|
| `classes.puml` | **Diagrama de Classes** (UML) | Classes do sistema: Usuario, Consumidor, Produtor (herança), Anuncio, Avaliacao, Mensagem, Bot — com atributos e métodos |
| `casos-de-uso.puml` | **Diagrama de Casos de Uso** (UML) | Atores (Visitante, Consumidor, Produtor) e tudo que cada um pode fazer no sistema |
| `diagrama-banco.html` | **Diagrama Entidade-Relacionamento** | Estrutura do banco de dados (tabelas e relacionamentos) |

> **Observação:** os `.html` (banco + versões antigas) usam Mermaid e abrem no
> navegador com duplo clique. Os `.puml` produzem UML padrão e precisam do
> site do PlantUML para gerar a imagem.

## Outras ferramentas que aceitam PlantUML

- **PlantUML online**: https://www.plantuml.com/plantuml/uml/
- **PlantText**: https://www.planttext.com/ *(preview ao vivo enquanto edita)*
- **Extensão do VS Code**: instale "PlantUML" do Jebbs — abre o `.puml` e
  aperta `Alt+D` pra ver o preview direto no editor (precisa do Java no PC)
- **Draw.io**: aceita importar PlantUML em Arrange → Insert → Advanced → PlantUML
