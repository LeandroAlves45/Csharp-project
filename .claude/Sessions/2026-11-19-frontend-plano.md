# Sessão 19/11/2026: plano do frontend

## O que se fez

- Análise de `docs/` (ARCHITECTURE, TEAM, SPRINTS, COMMANDS) e do layout AutoRent v2 (Claude Design).
- Plano do frontend aprovado: `C:\Users\Leandro Alves\.claude\plans\claude-atua-como-um-woolly-tiger.md`.
- Documentação atualizada (por commitar):
  - `docs/SPRINTS.md`: branches por função (`auth`, `cars`, `reservations`, `frontend`) e nota de que o frontend arranca no Sprint 0 com mocks.
  - `docs/COMMANDS.md`: secção 2 com as branches novas.
  - `docs/ARCHITECTURE.md`: secção 8, mensagens das exceções em português.
  - `.claude/CLAUDE.md`: código e nomes em inglês, comentários e mensagens da API em português, commits em inglês.

## Decisões

| Decisão | Porquê |
| --- | --- |
| Frontend começa já, com dados mock | Backend ainda vazio; serviços devolvem `Observable` (`of(mock)`), depois trocam para `HttpClient` sem mexer nos componentes |
| Branches com nome da função | O nome diz o que a branch contém |
| Comentários em português | Apresentação ao formador em português |
| Mensagens da API em português | O frontend mostra-as diretamente ao utilizador |
| Método de trabalho | Claude dá conceito + pseudocódigo bloco a bloco com comentários; Leandro escreve; Claude revê |

## Factos verificados

- Angular CLI 22.3.0, Node 24.21.0, npm 11.19.0.
- `ng new --help` (CLI 22.3.0): existem `--directory`, `--style css`, `--ssr`, `--routing`, `--skip-git`, `--ai-config none`. Ficheiros no estilo 2025 por omissão (`app.ts`, não `app.component.ts`). Testes com Vitest por omissão. `--standalone` true por omissão. `--zoneless` sem valor fixo (pode perguntar).
- Branch `frontend` alinhada com `main` (0 commits de diferença).

## Layout AutoRent v2 (resumo)

- Tokens `:root` prontos: primária `#3D3BF3`, destaque lima `#D4FF3A`, tinta `#0F0F1A`, fundo `#F4F4F8`; fontes Bricolage Grotesque, DM Sans, JetBrains Mono.
- Componentes: `.btn`, `.field`, `app-alert`, `.tag`/`app-status-badge`/`app-plate`, `app-car-card`, `app-navbar`, `app-confirm-modal`.
- Ecrãs: login, registo, carros (inicial, modal, sucesso, indisponível, vazio), reservas (erro ao cancelar, vazio), 404.

## Em aberto

- Avisar a equipa no WhatsApp das branches novas.
- Categorias dos carros têm de bater com o seed do Rodrigo.
- DTOs por combinar (S0-06); interfaces TypeScript são rascunho.
- Google Fonts precisa de internet; fallback `system-ui`.

## Próximo passo

Passo 1: `ng new` dentro de `frontend/` e explorar os ficheiros gerados.
