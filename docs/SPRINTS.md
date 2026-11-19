# Planeamento e sprints

**Versão simples:** em vez de construir a casa toda e só no fim ver se está boa, construímos um quarto de cada vez. No fim de cada quarto olhamos todos para ele e decidimos o que mudar no próximo.

**Versão técnica:** sprints curtos com um objetivo claro, um quadro Kanban como fonte única de verdade, cerimónias reduzidas ao mínimo útil, e uma revisão no fim de cada sprint para adaptar o plano. É isto que o formador avalia em "Gestão e planeamento" e em "adaptação e iteração".

Prazo de entrega e apresentação: **sexta-feira, 27/11/2026**.

## 1. Calendário

| Sprint | Datas | Objetivo | Terminou quando |
| --- | --- | --- | --- |
| Sprint 0 | Qui 19 e Sex 20 | Preparação e contratos | Os quatro compilam e correm a solução. Models, interfaces e DTOs combinados. |
| Sprint 1 | Sáb 21 a Seg 23 | Backend completo | Os 6 endpoints funcionam com todas as regras e dados em `List<T>`. Testes de cada área escritos. Review feita. |
| Sprint 2 | Ter 24 a Qui 26 | Frontend, extras e entregáveis | 4 ecrãs Angular ligados à API, relatório escrito, extras escolhidos concluídos. |
| Code freeze | Qui 26 às 18h | Fecho | Só entram correções de erros. |
| Entrega | Qui 26 à noite e Sex 27 | Ensaio e entrega | Ensaio cronometrado, entrega e apresentação. |

O fim de semana está no Sprint 1 mas foi planeado com pouca disponibilidade. Quem tiver mais tempo adianta tarefas.

## 2. Cerimónias

| Cerimónia | Quando | Duração | O que se faz |
| --- | --- | --- | --- |
| Planning | Início de cada sprint | 15 min | Escolher as issues do sprint e confirmar responsáveis |
| Daily assíncrona | Todos os dias, no WhatsApp | 2 min | Cada um escreve: o que fiz, o que vou fazer, o que me bloqueia |
| Review | Fim de cada sprint | 15 min | Demo do que está feito. Decidir o que entra no sprint seguinte |
| Retrospetiva | Logo a seguir à review | 10 min | O que correu bem, o que correu mal, o que mudamos. Fica escrita no fim deste ficheiro |

## 3. Quadro Kanban (GitHub Projects)

- Colunas: Backlog, To Do, In Progress, In Review, Done.
- Cada tarefa do backlog abaixo é uma issue, com responsável e etiqueta: `backend`, `frontend`, `tests`, `docs`, `extra`.
- Cada pull request indica a issue que fecha, por exemplo `Closes #12`.
- Ninguém tem mais de 2 issues em In Progress ao mesmo tempo.

## 4. Regras de Git

Cada pessoa trabalha na sua branch: `Bruno`, `Leandro`, `Pedro`, `Rodrigo`.

1. O `main` está sempre a compilar e a funcionar. Ninguém faz push direto para o `main`.
2. Todos os dias, antes de começar, cada um traz o `main` para a sua branch (`git merge main`). Branches por pessoa tendem a afastar-se do `main`, e isto evita conflitos grandes no fim.
3. Quando uma funcionalidade fica pronta, abre-se um pull request da branch pessoal para o `main`. Pull requests pequenos e frequentes, não um enorme no fim do sprint.
4. Cada pull request precisa da aprovação de pelo menos um colega.
5. Antes de abrir um pull request: `dotnet build` e `dotnet test` sem erros.
6. Mensagens de commit curtas, em inglês, a dizer o que muda. Exemplo: `Add overlap rule to reservation service`.

Os comandos estão em `docs/COMMANDS.md`, secção 2.

## 5. Backlog

### Sprint 0: preparação (Qui 19 e Sex 20)

| ID | Tarefa | Responsável | Estado |
| --- | --- | --- | --- |
| S0-01 | Convidar rcanelas, Rodrigo, Bruno e Pedro como colaboradores do repositório | Leandro | |
| S0-02 | Criar o quadro Kanban e as etiquetas | Leandro | |
| S0-03 | Instalar .NET 10, Node.js LTS e Angular CLI 22, e confirmar versões | Todos | |
| S0-04 | Corrigir a base: projeto Web API, projeto de testes, solução e `.gitignore` | Leandro | Feito |
| S0-05 | Escolher e configurar a interface de teste da API (Scalar ou Swagger UI) | Leandro | |
| S0-06 | Reunião de contratos: Models, interfaces de repositórios e serviços, DTOs | Todos | |
| S0-07 | Cada um faz `git merge main` na sua branch, compila e corre a API | Todos | |
| S0-08 | README com instruções para correr o projeto | Leandro | |

### Sprint 1: backend (Sáb 21 a Seg 23)

| ID | Tarefa | Responsável | Estado |
| --- | --- | --- | --- |
| S1-01 | Exceções próprias e handler global com os códigos de `ARCHITECTURE.md`, secção 8 | Leandro | |
| S1-02 | Registo das dependências no `Program.cs` (repositórios em memória como Singleton) | Leandro | |
| S1-03 | Método da regra de sobreposição (prioridade, primeiro dia) | Bruno | |
| S1-04 | `Reservation`, `ReservationStatus` e repositório em memória | Bruno | |
| S1-05 | Criar reserva com regras R1 a R5 | Bruno | |
| S1-06 | Cancelar reserva com regras C1 a C3 | Bruno | |
| S1-07 | Histórico: listar reservas por utilizador e `ReservationsController` | Bruno | |
| S1-08 | Testes das regras de reservas | Bruno | |
| S1-09 | `User`, repositório em memória e hash das passwords | Pedro | |
| S1-10 | Registo com validação de dados e email único | Pedro | |
| S1-11 | Login e `AuthController` | Pedro | |
| S1-12 | Testes de autenticação | Pedro | |
| S1-13 | `Car`, seed dos carros e repositório em memória | Rodrigo | |
| S1-14 | Pesquisa por disponibilidade (reutiliza a regra de sobreposição) e `CarsController` | Rodrigo | |
| S1-15 | Testes da pesquisa por disponibilidade | Rodrigo | |
| S1-16 | Review do Sprint 1 com demo e retrospetiva escrita | Todos | |

### Sprint 2: frontend, extras e entregáveis (Ter 24 a Qui 26)

| ID | Tarefa | Responsável | Estado |
| --- | --- | --- | --- |
| S2-01 | Criar o projeto Angular, rotas, `HttpClient` e URL da API | Leandro | |
| S2-02 | Ativar CORS no backend para `http://localhost:4200` | Leandro | |
| S2-03 | Ecrãs de Login e Registo e serviço de autenticação | Leandro | |
| S2-04 | Ecrã de Carros disponíveis com reserva | Leandro | |
| S2-05 | Ecrã As minhas reservas com cancelamento | Leandro | |
| S2-06 | Testar a integração de cada área no frontend e corrigir erros da API | Pedro, Rodrigo, Bruno | |
| S2-07 | Extras escolhidos na review do Sprint 1 | A definir | |
| S2-08 | Relatório de 2 a 4 páginas (cada um escreve a sua secção) | Todos | |
| S2-09 | Guião da demo e divisão da apresentação | Todos | |
| S2-10 | Code freeze e verificação final do README | Leandro | |

### Extras, por ordem de complexidade

Só entram depois do núcleo concluído. A escolha é feita na review do Sprint 1.

| Extra | Complexidade | Responsável provável |
| --- | --- | --- |
| `GET /api/reservations/{id}` | Baixa | Bruno |
| Resumo: total de reservas ativas e faturação | Baixa | Bruno |
| Persistência com EF Core e SQLite | Média | Leandro |
| Autenticação com JWT | Alta | Pedro |

## 6. Riscos

| Risco | Impacto | Como reduzimos |
| --- | --- | --- |
| Pouco tempo e horas incertas | Alto | Núcleo primeiro, extras só depois da review do Sprint 1 |
| Branches por pessoa afastam-se do `main` | Médio | `git merge main` todos os dias e pull requests pequenos |
| O Rodrigo depende da regra de sobreposição do Bruno | Médio | O Bruno faz esse método primeiro, no primeiro dia do Sprint 1 |
| O frontend está todo num só elemento | Médio | Backend pronto no fim do Sprint 1. Os outros ajudam a testar a integração no Sprint 2 |
| Alguém não sabe explicar uma parte | Alto | Revisão cruzada de pull requests e ensaio com perguntas |

## 7. Retrospetivas

### Sprint 0

- Correu bem:
- Correu mal:
- O que mudamos:

### Sprint 1

- Correu bem:
- Correu mal:
- O que mudamos:

### Sprint 2

- Correu bem:
- Correu mal:
- O que mudamos:
