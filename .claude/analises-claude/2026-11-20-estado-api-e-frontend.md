# Estado da API e impacto no frontend (20/11/2026)

Análise feita no início do dia 2 do frontend, na branch `frontend`. Hoje só o Leandro trabalha no projeto, por isso estes pontos ficam para os donos de cada área.

## Como foi verificado

- `git ls-remote origin`: não há commits novos dos colegas desde 19/11 (`cars` a41c791, `users` d521d1b, `feature/reservation` 038290b). O PR #4 (`frontend`) já está no `main` (b4f0929).
- Cópia do repositório no scratchpad. Comandos: `dotnet build RentACar.slnx` (0 erros, 5 avisos CS8618 em `Car.cs`; o CS0117 de ontem está resolvido) e `dotnet test RentACar.slnx` (1 teste, o do template).
- A API foi arrancada a partir da cópia (`dotnet run --launch-profile https --urls https://localhost:7299`) e recebeu pedidos reais com `curl`.
- No `frontend/`: `ng build` OK e `ng test --watch=false` (1 teste, passa).
- Preflight CORS a partir de `http://localhost:4200`: 204, com `Access-Control-Allow-Origin` certo.

## Resultado dos pedidos

| Pedido | HTTP | Corpo | Esperado (`ARCHITECTURE.md`) |
| --- | --- | --- | --- |
| `GET /api/cars` | 200 | JSON com o campo `image` (vazio) | `imageUrl` |
| `GET /api/cars?startDate=2026-12-01&endDate=2026-12-05`, com o carro 1 reservado | 200 | Os 5 carros | Só os disponíveis (R3) |
| `GET /api/cars/99` | 404 | Texto: `Carro não encontrado.` | ProblemDetails |
| `POST /api/auth/register` ok | 201 | `{"id":1,"name":"Ana","email":"ana@teste.com"}` | OK |
| Registo com email repetido / email inválido / corpo vazio | 409 / 400 / 400 | Texto simples | ProblemDetails |
| `POST /api/auth/login` ok / password errada | 200 / 401 | Erro em texto simples | ProblemDetails |
| `POST /api/reservations` ok | 201 | Model `Reservation` com `"status":0` | `ReservationResponse` com `"Active"` |
| Reserva sobreposta / no passado / mais de 30 dias / carro 99 / utilizador 99 | **500** | ProblemDetails **sem `detail`** | 409 / 400 / 400 / 404 / 404 |
| Cancelar reserva de outro utilizador / já cancelada / id 99 | **500** | Igual ao anterior | 403 / 409 / 404 |
| Cancelar ok | 200 | Vazio | 200 |

Exemplo de um 500 das reservas:

```json
{"type":"https://tools.ietf.org/html/rfc9110#section-15.6.1","title":"An error occurred while processing your request.","status":500,"traceId":"00-aaf8..."}
```

O que mudou desde ontem: a stack trace deixou de aparecer, porque o `GlobalExceptionHandler` não deixa passar detalhes de exceções que não conhece. Em contrapartida, a mensagem também não chega ao utilizador.

## Problemas

### 1. Nas reservas, todas as regras de negócio dão 500 (Bruno), bloqueante

- **Prova:** tabela acima, 8 casos com 500.
- **Causa:** `ReservationServices.cs` lança `ArgumentException`. O handler global só converte as 5 exceções próprias; para as outras devolve `false`, e o ASP.NET Core responde com um 500 genérico.
- **Impacto no frontend:** o ecrã não consegue dizer "carro ocupado" nem "já não pode cancelar". Só consegue mostrar uma mensagem genérica.
- **Correção:**
  - `ConflictException`: sobreposição (R3), reserva já cancelada (C2), cancelamento no dia de início ou depois (C3).
  - `BadRequestException`: data no passado, data de fim antes da de início, mais de 30 dias (R2, R4).
  - `NotFoundException`: carro, utilizador ou reserva inexistente (R1).
  - `ForbiddenException`: cancelar a reserva de outra pessoa (C1).
  - Validar o R1 (carro e utilizador existem) **antes** da sobreposição. Hoje um carro inexistente pode ser tratado primeiro como conflito.

### 2. Na autenticação, os erros saem em texto simples (Pedro)

- **Prova:** registo e login, tabela acima (`content-type: text/plain`).
- **Causa:** `AuthController` tem `try/catch` com `BadRequest(ex.Message)`, `Conflict(...)` e `Unauthorized(...)`. O service lança `ArgumentException`, `InvalidOperationException` e `UnauthorizedAccessException`.
- **Impacto no frontend:** funciona, mas num formato diferente das outras áreas. O frontend tem de suportar os dois formatos.
- **Correção:**
  - No service, usar `BadRequestException`, `ConflictException` e `UnauthorizedException`.
  - Tirar os `try/catch` do controller.
  - Na mensagem "A senha deve ter...", trocar "senha" por "password".

### 3. Carros: o filtro por datas é ignorado e o campo chama-se `Image` (Rodrigo)

- **Prova:** com o carro 1 reservado de 1 a 5 de dezembro, `GET /api/cars?startDate=2026-12-01&endDate=2026-12-05` devolve o carro 1.
- **Causa:** o `CarsController` não recebe `startDate`/`endDate` (S1-14 por fazer; depende do método de sobreposição do Bruno, S1-03).
- **Impacto no frontend:** o ecrã Carros mostraria carros ocupados, e o utilizador só daria pelo erro ao reservar (que hoje dá 500, ver ponto 1).
- **Correção:**
  - S1-14: pesquisa por disponibilidade que reutiliza o método do Bruno.
  - `Image` → `ImageUrl`, como combinado.
  - Resolver os avisos CS8618 (`= string.Empty`).
  - O 404 deve passar a `NotFoundException` lançada no service.

### 4. Models expostos na API (Bruno, Rodrigo)

- **Prova:** `POST /api/reservations` recebe `Reservation` (`[FromBody]`), e o pedido aceitou `id`, `status` e `totalPrice`. Hoje o service escreve por cima desses valores, mas o contrato não devia permitir enviá-los. `GET /api/cars` devolve `Car`.
- **Correção:** criar `CreateReservationRequest`, `ReservationResponse` e `CarResponse` (`ARCHITECTURE.md`, secção 4.3).

### 5. O `status` da reserva sai como número (Leandro e Bruno)

- **Prova:** `"status":0`.
- **Impacto no frontend:** o `reservation.ts` usa `'Active' | 'Cancelled'`, e o botão Cancelar depende disso.
- **Proposta:** acrescentar `JsonStringEnumConverter` no `Program.cs` com `AddControllers().AddJsonOptions(...)`. Muda o contrato das reservas, por isso só se aplica com o OK do Bruno.

### 6. A regra de sobreposição não é reutilizável (Bruno)

- Está escrita dentro do `foreach` do `CreateReservation`. Tem de passar a um único método público, para o Rodrigo o reutilizar (S1-03).

### 7. Nomes das interfaces (Pedro)

- `AuthService` e `UserRepository` são interfaces sem o prefixo `I`.
- `AuthServiceUI` está no namespace `Repositories`.
- Proposta: `IAuthService`/`AuthService` e `IUserRepository`/`InMemoryUserRepository`. Muda o `Program.cs`, o que tem de ser combinado com o Leandro.

### 8. Não há testes nos services (todos)

- Só existe o `UnitTest1` do template. Cada área tem de escrever os seus (S1-08, S1-12, S1-15).

### 9. O ficheiro `.http` está incompleto (todos)

- `RentACar.Api.http` aponta para `http://localhost:5288` e só tem pedidos de autenticação. Cada um acrescenta os da sua área.

## Impacto no plano do frontend

- A autenticação já funciona na API real, por isso o Passo 6 usa `HttpClient` diretamente.
- Carros e reservas continuam com dados mock até os pontos 1, 3, 4 e 5 estarem resolvidos.
- Enquanto isso não acontecer, o frontend lê os erros em 3 formatos:
  - texto simples;
  - ProblemDetails com `detail`;
  - ProblemDetails 500 sem `detail`.

  Também trata `status 0` (API desligada). Isto fica num único sítio (`getErrorMessage`).

## Ajustes no trabalho do Leandro

- `core/models/car.ts`: o comentário dizia que o model espelhava a API, mas a API ainda devolve `image`. Comentário corrigido.
- `core/models/reservation.ts`: depende do ponto 5.
- `app.config.ts`: falta `provideHttpClient()` (entra no Passo 6).
- Por commitar: `docs/ARCHITECTURE.md` (secção 8.1) e `docs/SPRINTS.md`. O `main` local está atrás do `origin/main`.
