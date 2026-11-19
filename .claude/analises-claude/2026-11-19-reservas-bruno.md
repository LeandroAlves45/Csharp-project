# Análise das reservas do Bruno (19/11/2026)

Análise feita na branch `frontend`, depois do merge do PR #3 (`feature/reservation`, commits `b23dd77` e `038290b`).

Ficheiros analisados: `Models/Reservation.cs`, `Models/ReservationStatus.cs`, `Repositories/IReservationRepository.cs`, `Repositories/InMemory/InMemoryReservationRepository.cs`, `Services/ReservationServices.cs`, `Controllers/ReservationsController.cs` e o `Program.cs` (registo).

## Como foi verificado

- `dotnet build RentACar.slnx --no-incremental`: compila, 0 erros, 5 avisos (todos em `Car.cs`, já conhecidos). As reservas não trazem avisos novos.
- `dotnet test`: 1 teste (template), passa. Não há testes de reservas.
- API arrancada com `--launch-profile https` e testada com `curl` (datas relativas a 19/11/2026):

| Pedido | Esperado (ARCHITECTURE.md) | Obtido |
| --- | --- | --- |
| Criar reserva válida (24 → 27, carro 1) | 201 | **201**, `totalPrice: 105.00` (3 dias × 35) ✔ |
| Criar no carro 1 a começar no dia 27 (dia de devolução) | 409 (R3) | **500** `System.ArgumentException: A reserva conflita...` |
| Criar com início no passado | 400 (R2) | **500** |
| Criar com carro inexistente | 404 (R1) | **500** |
| Cliente envia `totalPrice: 1`, `status: 1`, `id: 500` | ignorados | ignorados: o service recalcula tudo ✔ |
| `GET /api/reservations?userId=1` | 200 | 200 ✔, mas `"status": 0` (número) |
| Cancelar reserva de outro utilizador | 403 (C1) | **500** |
| Cancelar reserva própria | 200 | 200 ✔, corpo vazio |
| Cancelar outra vez | 409 (C2) | **500** |
| Cancelar no dia de início | 409 (C3) | **500** |
| Preflight CORS de `localhost:4200` | 204 | 204 ✔ |

**Conclusão:** as regras de negócio R1-R5 e C1-C3 estão certas. O que está errado é a forma como os erros chegam ao cliente: todos saem como **500 com a stack trace**. O contrato também não usa DTOs.

---

## A. Bloqueiam o frontend

### A1. Todos os erros de negócio dão 500

- **Causa:** o service lança sempre `ArgumentException` e o controller não a apanha. O ASP.NET Core trata-a como erro inesperado: em Development devolve a página de exceção (texto com a stack trace) e em Production devolveria 500 sem mensagem.
- **Impacto:** o frontend não consegue distinguir "carro ocupado" de "servidor em baixo", nem mostrar a mensagem ao utilizador.
- **Correção:** é a A3 da análise anterior (exceções próprias + handler global → `ProblemDetails`). Depois, o Bruno troca cada `ArgumentException` pela exceção certa:

| Regra | Mensagem atual | Exceção | Código |
| --- | --- | --- | --- |
| R1 carro | "O carro selecionado não existe." | `NotFoundException` | 404 |
| R1 utilizador | "O usuário selecionado não existe." | `NotFoundException` | 404 |
| R2 passado | "A data de inicio não pode ser no passado." | `BadRequestException` | 400 |
| R2 ordem | "A data de fim não pode ser antes da data de inicio." | `BadRequestException` | 400 |
| R4 | "A reserva não pode exceder 30 dias." | `BadRequestException` | 400 |
| R3 | "A reserva conflita com uma reserva existente." | `ConflictException` | 409 |
| Cancelar inexistente | "A reserva não existe." | `NotFoundException` | 404 |
| C1 | "O usuário não tem permissão..." | `ForbiddenException` | 403 |
| C2 | "A reserva já foi cancelada." | `ConflictException` | 409 |
| C3 | "A reserva não pode ser cancelada após a data de inicio." | `ConflictException` | 409 |

- **Dono:** Leandro (exceções + handler), depois Bruno (troca no service). **Prioridade máxima.**

### A2. `status` sai como número (`0`/`1`)

- **Prova:** `"status":0` nas respostas.
- **Causa:** por omissão, o `System.Text.Json` serializa enums como inteiros (já estava previsto na nota D da análise anterior).
- **Impacto:** o frontend precisa de saber se a reserva está `Active` para mostrar o botão Cancelar. Comparar com `0` é frágil: se alguém mudar a ordem do enum, o significado muda sem ninguém dar por isso.
- **Correção proposta** (no `Program.cs`, área do Leandro, combinar com o Bruno):
  ```csharp
  using System.Text.Json.Serialization;
  // Enums saem como texto ("Active") em vez de número (0): o JSON lê-se sem conhecer o C#
  builder.Services.AddControllers()
      .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
  ```
  Alternativa: o `ReservationResponse` (B1) ter `string Status`.

---

## B. Contrato diferente do `ARCHITECTURE.md`

### B1. O controller recebe e devolve o Model `Reservation`

- Regra do `CLAUDE.md`: "Models nunca saem da API diretamente".
- Hoje o cliente pode enviar `id`, `totalPrice`, `status`, `createdAt` e `cancelledAt`. O service sobrescreve-os todos (testado), por isso não há falha de segurança, mas o contrato engana: parece que o cliente pode definir o preço.
- **Correção:** `CreateReservationRequest` (`UserId`, `CarId`, `StartDate`, `EndDate`) e `ReservationResponse`. O JSON de entrada que o frontend envia fica igual.
- **Dono:** Bruno.

### B2. A regra de sobreposição (R3) não está num método próprio

- Está dentro do `foreach` do `CreateReservation`. O doc (sec. 7) pede **um único método**, reutilizado também pelo Rodrigo no `GET /api/cars?startDate=&endDate=` (B5 da análise anterior).
- **Correção proposta:** um método público, por exemplo `bool IsCarAvailable(int carId, DateOnly start, DateOnly end)`, no `ReservationService`, com o comentário do buffer de limpeza do doc.
- **Dono:** Bruno (e o Rodrigo usa-o depois).

### B3. Sem interface no service e nomes inconsistentes

| Atual | Proposta | Porquê |
| --- | --- | --- |
| `ReservationService` sem interface | `IReservationService` + `ReservationService` | Regra: cada camada depende de interfaces |
| Ficheiro `ReservationServices.cs` | `ReservationService.cs` | O nome do ficheiro deve ser igual ao da classe |
| `Repositories/InMemory/` só para reservas | Mesma pasta para todos os repositórios, ou para nenhum | Hoje há três padrões diferentes (`MemoryUserRepository`, `InMemoryCarRepository`, `InMemory/InMemoryReservationRepository`) |
| `AddReservation` | `Add` | Igual ao `UserRepository.Add`; o tipo já diz o que é |

### B4. O Id é gerado no service

- `reservation.Id = ... Max(r => r.Id) + 1` está no `ReservationService`. No `MemoryUserRepository` o Id é gerado no repositório.
- O doc diz que o repositório trata da leitura e da escrita. Gerar o Id é um detalhe de armazenamento (com SQLite, quem o gera é a base de dados), por isso deve ficar no repositório.

### B5. O cancelamento não passa pelo repositório

- O service muda `Status` e `CancelledAt` diretamente no objeto. Funciona porque a lista em memória guarda a referência, mas com SQLite a alteração não seria gravada.
- **Proposta:** `IReservationRepository.Update(Reservation reservation)`, mesmo que em memória não faça nada. Assim, a troca para SQLite só mexe no repositório (objetivo do doc sec. 4.1).

### B6. O cancelamento devolve `200` com corpo vazio

- Aceitável. Se devolver o `ReservationResponse` atualizado, o frontend atualiza a linha da tabela sem pedir a lista outra vez. A decidir com o Leandro.

---

## C. Qualidade (não bloqueia)

1. **Ordem das validações:** a sobreposição (R3) é verificada antes de confirmar que o carro e o utilizador existem (R1). Um carro inexistente com datas sobrepostas recebe "conflita" em vez de "não existe". Validar R1 primeiro.
2. **Mensagens em português do Brasil:** "usuário" → "utilizador"; "inicio" → "início". "A data de fim não pode ser antes da data de inicio" também apanha datas iguais: melhor "A data de fim tem de ser depois da data de início."
3. **Mensagem do C3:** diz "após a data de inicio", mas também bloqueia no próprio dia. Proposta: "Só é possível cancelar até ao dia anterior ao início."
4. **`CreatedAt`/`CancelledAt` com `DateTime.Now`;** o `User` usa `DateTime.UtcNow`. Uniformizar para `UtcNow`.
5. **Rota `{id}` sem restrição de tipo:** `[HttpPost("{id:int}/cancel")]`, como o Rodrigo fez em `cars/{id:int}`.
6. **`using` a mais:** `System`, `System.Collections.Generic`, `System.Text` (já vêm dos implicit usings ou não são usados).
7. **Indentação** de `reservation.Status = ReservationStatus.Cancelled;` no `CancelReservation`.
8. **`GetAll()` devolve a lista interna**, como no repositório de carros.
9. **Testes:** nenhum. As regras do Bruno são as mais importantes do projeto. Sugestão de nomes:
   - `CreateReservation_WhenStartDateIsInThePast_ThrowsBadRequestException`
   - `CreateReservation_WhenStartsOnPreviousReturnDay_ThrowsConflictException` (o dia de devolução está bloqueado)
   - `CreateReservation_WhenValid_CalculatesTotalPriceFromDays`
   - `CancelReservation_WhenUserIsNotOwner_ThrowsForbiddenException`
   - `CancelReservation_OnStartDay_ThrowsConflictException`
10. **`RentACar.Api.http`:** faltam pedidos de reservas.

---

## D. Impacto no frontend (Leandro)

| Ficheiro | Ajuste | Quando |
| --- | --- | --- |
| `core/models/reservation.ts` | Tirar o comentário "RASCUNHO: o backend ainda não existe". Acrescentar `userId: number` ao `Reservation` (a API já o envia) | Já |
| `core/models/reservation.ts` | `ReservationStatus` só funciona depois de A2 | Depois de A2 |
| Serviço de reservas (Passo 8) | Cancelar com `POST /api/reservations/{id}/cancel?userId={id}` (userId na query string, não no corpo) | Passo 8 |
| Serviço de reservas (Passo 8) | O cancelamento devolve corpo vazio: voltar a pedir a lista (ou atualizar a linha à mão) | Passo 8, a menos que B6 mude |
| `CreateReservationRequest` | Já está certo: a API aceitou exatamente `{ userId, carId, startDate, endDate }` | — |

---

## Ordem sugerida

1. **Leandro:** exceções + handler global (A1) e `JsonStringEnumConverter` (A2).
2. **Bruno:** trocar `ArgumentException` pelas exceções, DTOs (B1), método único de sobreposição (B2), testes (C9).
3. Reunião curta de nomes (B3), para os três repositórios e services seguirem o mesmo padrão.
