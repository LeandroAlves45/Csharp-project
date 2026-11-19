# Arquitetura do RentACar

Este documento explica como o projeto está organizado e porquê. Todos os elementos da equipa devem conseguir explicar o que está aqui, porque o formador vai perguntar "como se faz" e não só "o que faz".

Cada conceito importante tem duas explicações:

- **Versão simples:** uma analogia do dia a dia, para perceber a ideia.
- **Versão técnica:** os termos corretos, que são os que usamos na apresentação.

## 1. O que estamos a construir

Uma API de aluguer de carros. Um cliente cria conta, faz login, vê os carros disponíveis para umas datas, reserva um carro, consulta as suas reservas e cancela uma reserva respeitando regras.

Limites do enunciado que condicionam as decisões:

- API ASP.NET Core com 4 a 6 endpoints (o formador aceita mais se não forem demasiado complexos).
- Dados em memória com `List<T>` na versão obrigatória. SQL só como extra.
- Frontend opcional, conta como extra.
- Prazo: 27/11/2026, com apresentação de 10 minutos.

## 2. Stack

| Camada | Tecnologia | Versão | Notas |
| --- | --- | --- | --- |
| Backend | ASP.NET Core Web API com Controllers | .NET 10 (LTS) | Projeto `RentACar.Api` |
| Testes | xUnit | Template do .NET 10 | Projeto `RentACar.Tests` |
| Dados (fase 1) | `List<T>` em memória | | Obrigatório |
| Dados (fase 2) | Entity Framework Core com SQLite | | Extra, só se houver tempo |
| Documentação da API | OpenAPI (`Microsoft.AspNetCore.OpenApi`) | | Documento em `/openapi/v1.json` |
| Frontend | Angular, CSS simples, template driven forms | 22 | Pasta `frontend/` |
| IDE | Visual Studio | Com suporte a .NET 10 | |
| Repositório | GitHub | | `LeandroAlves45/Csharp-project` |

Todos os elementos da equipa devem ter a mesma versão major do .NET e do Angular. Ver `docs/COMMANDS.md`, secção 1.

## 3. Estrutura do repositório

```text
RentACar/                         raiz do repositório
  .claude/
    CLAUDE.md                     regras para o Claude Code
    docs/                         contexto extra para o Claude Code
  docs/                           documentação da equipa (este ficheiro)
  frontend/                       aplicação Angular (Sprint 2)
  RentACar/
    src/
      RentACar.Api/
        Controllers/              recebem pedidos HTTP
        Services/                 regras de negócio
        Repositories/             leitura e escrita de dados
        Models/                   entidades (User, Car, Reservation)
        DTOs/                     objetos de entrada e saída da API
        Exceptions/               exceções próprias e handler global
        Data/                     dados iniciais (seed)
        Properties/
          launchSettings.json     portas e perfis de arranque
        Program.cs                configuração da aplicação
        RentACar.Api.csproj
        RentACar.Api.http         pedidos de teste para o Visual Studio
    tests/
      RentACar.Tests/             testes xUnit
  RentACar.slnx                   solução (formato novo do .NET)
  README.md
```

O ficheiro `RentACar.slnx` é o formato novo de solução, em XML. Abre-se no Visual Studio da mesma forma que um `.sln`.

## 4. Arquitetura em camadas

Escolhemos uma arquitetura em camadas dentro de um só projeto (opção B). A Clean Architecture completa com 4 projetos (opção A) foi analisada e ficou documentada no Word do plano, mas não cabe bem no prazo.

**Versão simples:** organizar o código é como organizar um restaurante. O empregado recebe os pedidos (Controller), o chef cozinha seguindo as receitas (Service) e a despensa guarda os ingredientes (Repository). Ninguém faz o trabalho do outro. Se mudarmos de despensa, o chef continua a cozinhar da mesma forma.

**Versão técnica:** separação de responsabilidades em três camadas com inversão de dependências. Cada camada depende de interfaces e não de implementações concretas. As implementações são registadas no contentor de injeção de dependências do ASP.NET Core, no `Program.cs`, e injetadas pelo construtor.

### 4.1 O caminho de um pedido

```text
Pedido HTTP
   -> Controller   valida o formato, converte o DTO, chama o Service
   -> Service      aplica as regras de negócio, lança exceções se falharem
   -> Repository   lê e grava na List<T>
   <- Service      devolve o resultado
   <- Controller   converte para DTO de resposta e devolve o código HTTP
```

Regras que não se quebram:

1. O Controller não tem regras de negócio e nunca toca na `List<T>`.
2. O Service não sabe nada de HTTP (não devolve `IActionResult`, não conhece códigos de estado).
3. O Repository não tem regras de negócio. Só guarda e lê.
4. Cada camada fala com a seguinte através de uma interface (por exemplo `IReservationRepository`).

Se estas regras forem respeitadas, trocar a `List<T>` por SQLite só obriga a mexer nos Repositories e no `Program.cs`.

### 4.2 Injeção de dependências e tempo de vida

**Versão simples:** em vez de cada pessoa ir buscar as suas ferramentas, há um armazém que entrega a ferramenta certa a quem precisa. Algumas ferramentas são partilhadas por todos (Singleton), outras são novas para cada pedido (Scoped).

**Versão técnica:** o ASP.NET Core cria os objetos e injeta-os pelo construtor.

| Tipo | Tempo de vida | Porquê |
| --- | --- | --- |
| Repositories em memória | `Singleton` | A lista tem de sobreviver entre pedidos. Se fosse `Scoped`, cada pedido teria uma lista nova e os dados perdiam-se. |
| Services | `Scoped` | Um por pedido. Não guardam estado próprio. |

Limitação que devemos saber explicar: uma `List<T>` partilhada não é segura com pedidos em simultâneo. Para a demonstração é aceitável. Num sistema real usaríamos um `lock`, uma coleção concorrente ou uma base de dados.

### 4.3 Model e DTO

**Versão simples:** o Model é a ficha completa guardada no arquivo. O DTO é o formulário do balcão, só com os campos que interessam a quem pede.

**Versão técnica:** o DTO (Data Transfer Object) é o contrato da API. Impede que saiam campos internos, como o `PasswordHash`, e que o cliente envie campos que só o servidor pode definir, como `TotalPrice` ou `Status`.

Convenção de nomes:

- Entrada: `RegisterRequest`, `LoginRequest`, `CreateReservationRequest`.
- Saída: `UserResponse`, `CarResponse`, `ReservationResponse`.

## 5. Entidades

| Entidade | Campos | Notas |
| --- | --- | --- |
| `User` | `Id`, `Name`, `Email`, `PasswordHash`, `CreatedAt` | Email único. A password nunca é guardada em texto. |
| `Car` | `Id`, `Brand`, `Model`, `LicensePlate`, `Category`, `DailyPrice` | Carregados no arranque (seed). Não há endpoint para criar carros. |
| `Reservation` | `Id`, `UserId`, `CarId`, `StartDate`, `EndDate`, `TotalPrice`, `Status`, `CreatedAt`, `CancelledAt` | `Status` é o enum `ReservationStatus` com `Active` e `Cancelled`. Datas em `DateOnly`. |

As datas de reserva usam `DateOnly` porque o aluguer é ao dia. Não precisamos de horas.

## 6. Endpoints

| # | Método e rota | Responsável | O que faz | Sucesso |
| --- | --- | --- | --- | --- |
| 1 | `POST /api/auth/register` | Pedro | Cria conta | 201 |
| 2 | `POST /api/auth/login` | Pedro | Valida credenciais e devolve id e nome | 200 |
| 3 | `GET /api/cars?startDate=&endDate=` | Rodrigo | Lista carros. Com datas, só os disponíveis | 200 |
| 4 | `POST /api/reservations` | Bruno | Cria reserva (regras R1 a R5) | 201 |
| 5 | `POST /api/reservations/{id}/cancel` | Bruno | Cancela reserva (regras C1 a C3) | 200 |
| 6 | `GET /api/reservations?userId={id}` | Bruno | Lista as reservas de um utilizador | 200 |

## 7. Regras de negócio

### Ao criar uma reserva

| Regra | Descrição |
| --- | --- |
| R1 | O utilizador e o carro têm de existir. |
| R2 | A data de início não pode estar no passado e a data de fim tem de ser depois da data de início. |
| R3 | O carro não pode ter outra reserva ativa que se sobreponha às datas pedidas. O dia de devolução fica bloqueado para limpeza. |
| R4 | A duração máxima é de 30 dias. |
| R5 | O preço é calculado pelo servidor: dias entre `StartDate` e `EndDate` vezes `DailyPrice`. O dia de devolução bloqueia o carro mas não é cobrado. |

### Ao cancelar uma reserva

| Regra | Descrição |
| --- | --- |
| C1 | Só o dono da reserva a pode cancelar. |
| C2 | Só reservas com estado `Active` podem ser canceladas. |
| C3 | Só é possível cancelar até ao dia anterior à data de início. |

### A regra de sobreposição (R3)

**Versão simples:** duas pessoas não podem ter o mesmo carro ao mesmo tempo. E quando um carro é devolvido, a empresa precisa desse dia para o lavar. Se uma reserva acaba no dia 10, a próxima só pode começar no dia 11.

**Versão técnica:** interseção de intervalos fechados. Como os dois extremos bloqueiam o carro, usamos `<=` e `>=`:

```csharp
// Return day is blocked as a buffer day for cleaning and inspection,
// so both ends of the interval are inclusive.
bool overlaps = newStart <= existingEnd && newEnd >= existingStart;
```

Esta regra é usada em dois sítios: ao criar uma reserva (Bruno) e ao listar carros disponíveis (Rodrigo). Fica escrita **num único método**, da responsabilidade do Bruno, e é reutilizada. Isto aplica o princípio DRY (Don't Repeat Yourself): se a regra mudar, muda num só sítio.

## 8. Tratamento de erros

**Versão simples:** em vez de cada empregado decidir sozinho como dar uma má notícia ao cliente, há uma só pessoa responsável por isso, que responde sempre da mesma forma.

**Versão técnica:** os Services lançam exceções próprias. Um handler global, registado no pipeline do ASP.NET Core, apanha-as e converte-as no código HTTP certo, com uma resposta no formato `ProblemDetails`. Os Controllers não têm blocos `try/catch` repetidos.

| Exceção | Código HTTP | Exemplos |
| --- | --- | --- |
| `BadRequestException` | 400 Bad Request | Datas trocadas, mais de 30 dias, email vazio |
| `UnauthorizedException` | 401 Unauthorized | Password errada no login |
| `ForbiddenException` | 403 Forbidden | Cancelar a reserva de outra pessoa (C1) |
| `NotFoundException` | 404 Not Found | Carro, utilizador ou reserva inexistente (R1) |
| `ConflictException` | 409 Conflict | Carro ocupado (R3), email já registado, reserva já cancelada (C2), cancelamento tardio (C3) |

Evitámos o nome `ValidationException` porque já existe uma classe com esse nome no .NET (`System.ComponentModel.DataAnnotations`), o que causaria ambiguidades. Os nomes das exceções são uma proposta do Leandro, que é o responsável por esta parte. Se mudarem, este quadro tem de ser atualizado.

Porque 409 e não 400 quando o carro está ocupado? Porque o pedido está bem formado. O problema é o conflito com o estado atual do sistema.

## 9. Autenticação

Escolhemos o login simples (opção B): o login valida email e password e devolve o id do utilizador. O frontend guarda o id e envia-o nos pedidos.

- A password é sempre guardada como hash, nunca em texto.
- Esta solução **não é segura para produção**, porque qualquer pessoa pode enviar o id de outra. É uma limitação consciente por causa do prazo, e deve ser dita assim na apresentação.
- A melhoria seria JWT (opção A), que fica como extra.
- Uma opção para o hash é a classe `PasswordHasher<TUser>` do ASP.NET Core Identity. Antes de a usar, o Pedro confirma o pacote e a utilização em learn.microsoft.com e combina com a equipa, porque é uma dependência nova.

## 10. Frontend

- Angular 22, componentes standalone, CSS simples.
- Formulários template driven (`ngModel`), por serem os mais simples para formulários pequenos.
- 4 ecrãs: Login, Registo, Carros disponíveis (escolher datas e reservar), As minhas reservas (com cancelamento).
- Um serviço Angular por área (auth, cars, reservations), todos com `HttpClient`.
- O id do utilizador fica no `localStorage` depois do login.
- O backend tem de ativar CORS para `http://localhost:4200`, o endereço do `ng serve`.

## 11. Dados em duas fases

**Versão simples:** guardar numa `List<T>` é guardar brinquedos numa caixa que se esvazia quando apagas a luz. O SQLite é um armário onde os brinquedos ficam guardados.

**Versão técnica:** a fase 1 implementa as interfaces dos repositórios com `List<T>`. A fase 2, como extra, cria novas implementações com Entity Framework Core e SQLite. Para trocar, muda só o registo no `Program.cs`. Controllers, Services, Models e DTOs não mudam. É a melhor demonstração de porque é que as interfaces existem.

## 12. Decisões em aberto

| Decisão | Responsável | Estado |
| --- | --- | --- |
| Interface para testar a API no browser (Scalar ou Swagger UI). O template do .NET 10 só gera o documento OpenAPI, não traz interface. Até lá, usar o ficheiro `RentACar.Api.http`. | Leandro | Em aberto |
| Pacote para o hash das passwords | Pedro | Em aberto |
| Extras a implementar | Equipa, na review do Sprint 1 | Em aberto |
