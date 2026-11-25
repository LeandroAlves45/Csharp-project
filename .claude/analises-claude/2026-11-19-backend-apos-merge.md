# Análise do backend após o merge (19/11/2026)

Análise feita na branch `frontend`, depois do merge de `cars` (PR #1) e `users` (PR #2).
Objetivo: saber se o frontend já pode usar a API e o que tem de ser ajustado.

## Como foi verificado

- `dotnet build RentACar.slnx`: compila, com 5 avisos `CS8618` em `Models/Car.cs`.
- `dotnet test RentACar.slnx`: 1 teste (o `UnitTest1` do template), passa.
- API arrancada com o perfil `http` (`http://localhost:5288`) e pedidos feitos com `curl`. Os resultados estão em baixo.

| Pedido | Resultado |
| --- | --- |
| `GET /api/cars` | **500**: `Unable to resolve service for type 'RentACar.Api.Services.CarService'` |
| `POST /api/auth/register` (válido) | 201, `{"id":1,"name":"Teste","email":"t@t.pt"}` |
| `POST /api/auth/register` (email repetido) | 409, `text/plain`: `O email já está em uso.` |
| `POST /api/auth/login` (password errada) | 401, `text/plain`: `Email ou password inválidos.` |
| `POST /api/auth/login` (válido) | 200, `{"id":1,"name":"Teste","email":"t@t.pt"}` |
| `POST /api/auth/login` (campos vazios) | 400, `text/plain`: `Todos os campos são obrigatórios.` |
| `POST /api/auth/login` (JSON com tipo errado) | 400, `application/problem+json` (gerado pelo `[ApiController]`) |
| `OPTIONS /api/auth/login` com `Origin: http://localhost:4200` | **405**: não há CORS |

Conclusão: **auth funciona; carros ainda não**. O browser também não consegue chamar a API enquanto não houver CORS.

---

## A. Bloqueiam o frontend (resolver primeiro)

### A1. `CarService` e `ICarRepository` não estão registados no `Program.cs`

- **Prova:** `GET /api/cars` devolve 500 com a exceção acima.
- **Causa:** o PR `cars` criou o controller, o service e o repositório, mas o `Program.cs` só regista os serviços de utilizadores. O contentor de DI não sabe criar o `CarService`.
- **Correção proposta:**
  ```csharp
  // Singleton: a lista de carros tem de sobreviver entre pedidos
  builder.Services.AddSingleton<ICarRepository, InMemoryCarRepository>();
  // Scoped: um service por pedido, sem estado próprio
  builder.Services.AddScoped<ICarService, CarService>();   // ver B3: falta a interface
  ```
- **Dono:** `Program.cs` é do Leandro, mas os tipos são do Rodrigo. Combinar com o Rodrigo.

### A2. Falta CORS para `http://localhost:4200`

- **Prova:** o preflight `OPTIONS` devolve 405. O browser bloqueia o pedido antes de ele chegar ao controller.
- **Correção proposta** (S2-02, `ARCHITECTURE.md` sec. 10):
  ```csharp
  builder.Services.AddCors(options =>
      options.AddPolicy("Frontend", policy =>
          policy.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod()));
  // ...
  app.UseCors("Frontend");   // antes de UseAuthorization e MapControllers
  ```
- **Dono:** Leandro.

### A3. Os erros saem em dois formatos diferentes

- **Prova:** os erros dos services saem como `text/plain` (só a mensagem). Os erros de validação automática do `[ApiController]` saem como `application/problem+json`.
- **Impacto:** o frontend teria de tratar dois formatos. `ARCHITECTURE.md` sec. 8 define `ProblemDetails` para todos os erros.
- **Correção proposta:** criar `Exceptions/` (`BadRequestException`, `UnauthorizedException`, `ConflictException`, `NotFoundException`, `ForbiddenException`) e um handler global que as converte em `ProblemDetails`. Os services passam a lançá-las e os controllers deixam de ter `try/catch`.
- **Dono:** Leandro (exceções e handler). Depois, Pedro e Rodrigo trocam as exceções nos services deles.

---

## B. Contrato diferente do `ARCHITECTURE.md` (combinar com a equipa)

### B1. `CarsController` devolve o Model `Car` diretamente

- Regra do `CLAUDE.md`: "Models nunca saem da API diretamente". Falta um `CarResponse`.
- **Dono:** Rodrigo.

### B2. Nome e conteúdo do campo da imagem

- O Model tem `Image`; o doc (sec. 5 e 5.1) diz `ImageUrl` com caminho `/images/cars/<ficheiro>.jpg`.
- No seed, todos os `Image` estão vazios (`""`).
- **Decisão a tomar:** nome final (`imageUrl` no JSON) e lista de ficheiros. As fotografias ficam em `frontend/public/images/cars/` (Leandro).
- **Dono:** Rodrigo + Leandro.

### B3. Interfaces sem prefixo `I` e nomes inconsistentes

| Atual | Proposta | Porquê |
| --- | --- | --- |
| `interface AuthService` | `IAuthService` | Convenção .NET; já usada em `ICarRepository` |
| `class AuthServiceUI` | `AuthService` | "UI" não diz o que é; a classe está no namespace `RentACar.Api.Repositories`, mas o ficheiro está em `Services/` |
| `interface UserRepository` | `IUserRepository` | Mesma convenção |
| `MemoryUserRepository` | `InMemoryUserRepository` | Igual ao `InMemoryCarRepository` |
| `CarService` (sem interface) | `ICarService` + `CarService` | Regra: cada camada depende de interfaces |

- **Dono:** Pedro (auth) e Rodrigo (cars).

### B4. Nomes dos DTOs de entrada

- Atual: `SignIn` (registo) e `Login`. O doc (sec. 4.3) diz `RegisterRequest` e `LoginRequest`.
- "SignIn" significa entrar, não registar, por isso o nome engana quem lê o código.
- **Impacto no frontend:** nenhum. O JSON (`name`, `email`, `password`) fica igual, só muda o nome da classe C#.
- **Dono:** Pedro.

### B5. `GET /api/cars` ainda não filtra por datas

- O endpoint 3 aceita `?startDate=&endDate=` e devolve só os carros disponíveis. Depende do método de sobreposição (R3), que é do Bruno.
- **Impacto no frontend:** o ecrã de carros pode listar tudo por agora; o filtro entra depois.
- **Dono:** Rodrigo + Bruno.

### B6. Endpoint extra `GET /api/cars/{id}`

- Não está na lista dos 6 endpoints. Regra: endpoints novos só depois de a equipa combinar.
- O frontend não precisa dele (a lista já traz todos os dados).
- **Decisão:** manter (avisar a equipa) ou remover.

### B7. Categorias em inglês

- Seed: `Economy`, `Compact`, `Premium`. Design: Económico, Compacto, Carrinha, SUV, Elétrico, Premium.
- **Proposta:** a API envia a chave em inglês e o frontend traduz para o texto em português. Assim, os dados e o código ficam em inglês e a interface em português.
- **Dono:** Rodrigo (lista final) + Leandro (tradução).

---

## C. Qualidade (não bloqueia)

1. **`Models/Car.cs`: 5 avisos `CS8618`.** Usar `= string.Empty`, como em `User.cs`.
2. **Mensagens:** "A senha deve ter..." usa um termo do português do Brasil; o resto da API diz "password". Uniformizar para "A password deve ter pelo menos 6 caracteres."
3. **Testes:** só existe o `UnitTest1` do template. Faltam testes do `AuthService` (registo, email repetido, login errado) e do `CarService`.
4. **`RentACar.Api.http`:** não tem pedidos de carros, e a numeração salta do TESTE 2 para o TESTE 4.
5. **`InMemoryCarRepository.GetAll()`** devolve a própria lista interna, por isso quem a recebe pode alterá-la. Aceitável para a demo; dizer na apresentação ou devolver uma cópia (`_cars.ToList()`).
6. **`PasswordHasher<User>`:** compila sem `PackageReference` novo (o build passa sem nenhum pacote além do `Microsoft.AspNetCore.OpenApi`). A dúvida do doc sec. 9 ("confirmar o pacote") fica resolvida: não é preciso pacote novo.

---

## D. Notas para o Bruno (reservas, antes de começar)

- **Enums:** por omissão, o `System.Text.Json` envia os enums como número (`0`, `1`). Para o JSON trazer `"Active"`/`"Cancelled"`, ou o `ReservationResponse` usa `string Status`, ou se regista o `JsonStringEnumConverter`. Combinar com o Leandro, porque o frontend compara o estado para mostrar o botão Cancelar.
- **`DateOnly`:** o `System.Text.Json` envia-o como `"yyyy-MM-dd"`, que é o formato do `<input type="date">`.

---

## Atualização (19/11/2026, depois de falar com o Rodrigo)

- **B2 decidido:** o Rodrigo muda `Image` → `ImageUrl`. O frontend (`core/models/car.ts`) já usa `imageUrl`. Até o PR dele entrar, a API envia `image`, por isso `car.imageUrl` fica `undefined` em runtime. O TypeScript não consegue apanhar isto, porque só confia na interface.
- **A1 autorizado:** o Rodrigo deu OK para o Leandro registar os carros no `Program.cs`. Por agora fica `AddScoped<CarService>()` (classe concreta). A interface `ICarService` (B3) fica para o Rodrigo, junto com o `CarResponse` (B1), porque mexe em 3 ficheiros dele.
- **URL da API no frontend:** o Leandro escolheu `https://localhost:7215/api`. Foi verificado o seguinte:
  - `dotnet run` sem `--launch-profile` usa o **primeiro** perfil do `launchSettings.json` (`http`) e só escuta em `http://localhost:5288`. Com esse arranque, o 7215 não responde.
  - É preciso arrancar com `dotnet run --launch-profile https` (ou escolher "https" no Visual Studio).
  - O certificado de desenvolvimento está confiável nesta máquina (`dotnet dev-certs https --check --trust`). Cada colega que corra o frontend precisa do mesmo (`dotnet dev-certs https --trust`).

## Ordem sugerida

1. A1 + A2 (Leandro, com o OK do Rodrigo para A1). Depois disto o frontend já consegue ler carros e fazer login/registo.
2. A3 (Leandro): exceções + handler global.
3. B1-B4, B7 numa reunião curta de contratos (S0-06).
4. C quando houver tempo; testes antes da entrega.
