# Equipa e divisão de responsabilidades

A divisão é feita **por funcionalidade de ponta a ponta** e não por camadas. Cada pessoa é dona de uma área inteira, do Model ao Controller e aos testes. Assim cada um consegue explicar um fluxo completo ao formador, que é o que vale 50% da nota.

## 1. Quem faz o quê

| Pessoa | Área | Responsabilidades |
| --- | --- | --- |
| Pedro | Utilizadores e autenticação | `User`, `IUserRepository` e implementação em memória, `AuthService` (registo, login, validação de dados, hash das passwords), `AuthController`, DTOs da área, testes da área. |
| Rodrigo | Carros | `Car`, dados iniciais (seed), `ICarRepository` e implementação em memória, `CarService` com pesquisa por disponibilidade, `CarsController`, DTOs da área, testes da área. |
| Bruno | Reservas | `Reservation` e `ReservationStatus`, `IReservationRepository` e implementação em memória, `ReservationService` com as regras R1 a R5 e C1 a C3, histórico de reservas, `ReservationsController`, DTOs da área, testes da área. |
| Leandro | Frontend, arquitetura e integração. Scrum Master | Estrutura da solução, `Program.cs` (injeção de dependências, CORS, OpenAPI), exceções e handler global, aplicação Angular completa (4 ecrãs), integração com a API, quadro Kanban, cerimónias, consolidação do relatório. |

Todos:

- Escrevem os testes da sua área.
- Escrevem a secção do relatório sobre a sua área.
- Apresentam a sua parte, cerca de 2 minutos e meio cada.
- Revêem pelo menos um pull request de outro colega por sprint.

## 2. Dependências entre áreas

Estas ligações têm de ser combinadas cedo, para ninguém ficar parado à espera:

| Quem precisa | De quê | De quem | Quando |
| --- | --- | --- | --- |
| Rodrigo | Método da regra de sobreposição e `IReservationRepository` | Bruno | Primeiro dia do Sprint 1 |
| Bruno | `IUserRepository` e `ICarRepository` para validar R1 | Pedro e Rodrigo | Primeiro dia do Sprint 1 |
| Todos | Exceções próprias e handler global | Leandro | Primeiro dia do Sprint 1 |
| Leandro | Endpoints a funcionar e contratos dos DTOs | Pedro, Rodrigo, Bruno | Fim do Sprint 1 |

**Versão simples:** é como montar um puzzle a quatro. Antes de cada um começar a sua parte, combinamos a forma dos encaixes. Assim as peças encaixam no fim.

**Versão técnica:** trabalhamos por contrato. Interfaces, Models e DTOs são combinados no início. Quem consome uma interface pode avançar mesmo que a implementação ainda não exista. Mudar um contrato obriga a avisar no WhatsApp e a explicar no pull request.

## 3. Scrum Master

O Leandro é o Scrum Master. O papel não é ser chefe da equipa, é garantir que o processo funciona:

- Mantém o quadro Kanban atualizado.
- Conduz o planning, a review e a retrospetiva de cada sprint.
- Lembra a daily assíncrona no WhatsApp.
- Regista as retrospetivas em `docs/SPRINTS.md`.
- Deteta bloqueios cedo e ajuda a resolvê-los.

## 4. Comunicação

| Canal | Para quê |
| --- | --- |
| WhatsApp | Daily assíncrona, avisos rápidos, bloqueios |
| GitHub Issues e Projects | Tarefas e estado de cada tarefa |
| Pull requests | Revisão de código e discussão técnica |
| `docs/` | Decisões e documentação que ficam no projeto |

Regra: uma decisão técnica tomada no WhatsApp só conta depois de escrita em `docs/`.
