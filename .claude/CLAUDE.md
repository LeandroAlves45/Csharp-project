# RentACar: Claude Code

Projeto de avaliação C# das Academias Natixis (Dev Stream). API de aluguer de carros em ASP.NET Core (.NET 10) com frontend Angular 22. Equipa de 4: Pedro, Rodrigo, Bruno e Leandro. Entrega e apresentação a 27/11/2026.

O que mais conta na avaliação (50%) é cada elemento **saber explicar o código**. Por isso, o objetivo do Claude neste projeto não é só produzir código: é produzir código simples que a pessoa consegue explicar, e ajudá-la a percebê-lo.

## Ler primeiro

1. `docs/ARCHITECTURE.md`: stack, estrutura, camadas, entidades, endpoints, regras de negócio, códigos HTTP.
2. `docs/TEAM.md`: quem é dono de cada área e as dependências entre áreas.
3. `docs/SPRINTS.md`: sprint atual, backlog e regras de Git.
4. `docs/COMMANDS.md`: comandos do projeto.
5. `.claude/docs/`: contexto adicional para o Claude, se existir.

Se o que for pedido contradizer estes documentos, **dizer primeiro o que está em conflito** e perguntar antes de avançar. Se for preciso atualizar um documento, dizer o que vai mudar e só depois mudar.

## Regra permanente

**Não agir por suposições.** Verificar sempre os factos e confirmar a informação antes de decidir ou apresentar código. Na dúvida, perguntar. Quando não houver certeza, dizer o que se sabe, o que não se sabe e como verificar (documentação oficial em learn.microsoft.com ou angular.dev, ou um teste). Nunca inventar bibliotecas, métodos, APIs ou comportamentos.

## Comportamento de sessão

- Conversar em português de Portugal. Código e nomes em inglês. Comentários no código em português, para a apresentação ao formador. Mensagens da API para o utilizador (erros, validações) em português. Mensagens de commit em inglês.
- Só editar código ou ficheiros quando for pedido.
- Explicar a abordagem antes de mostrar código. Em conceitos novos, dar uma versão simples (com analogia) e uma versão técnica.
- Comentários no código explicam **o porquê** das decisões, não o que a linha faz.
- No fim de uma explicação importante, fazer uma ou duas perguntas para confirmar que a pessoa percebeu.
- Trabalhar passo a passo em tarefas maiores e pedir confirmação antes de avançar para o passo seguinte.
- Correr comandos no terminal é permitido, exceto comandos destrutivos (apagar ficheiros, `git reset --hard`, `git push --force`, apagar branches).
- **Nunca fazer `git commit`, `git push` ou merge sem pedido explícito.**

## Limites do projeto

- Dados em memória com `List<T>`. SQLite com EF Core só como extra, depois do núcleo concluído.
- 6 endpoints no núcleo (ver `docs/ARCHITECTURE.md`). Endpoints novos só depois de combinados com a equipa.
- **Nenhum pacote NuGet ou npm novo sem a equipa combinar antes.** Se uma tarefa parecer precisar de um, propor e explicar porquê, sem instalar.
- Simplicidade primeiro. Nada de padrões ou abstrações que o projeto não precise agora (sem MediatR, AutoMapper, Repository genérico, CQRS, etc.).

## Arquitetura (regras que não se quebram)

- Caminho de um pedido: Controller, depois Service, depois Repository.
- Controllers: recebem e devolvem DTOs, chamam o Service. Sem regras de negócio, sem acesso à `List<T>`.
- Services: todas as regras de negócio. Não conhecem HTTP. Quando uma regra falha, lançam as exceções próprias da pasta `Exceptions/`.
- Repositories: só leitura e escrita. Sem regras de negócio.
- Cada camada depende de interfaces, registadas no `Program.cs`. Repositórios em memória como `Singleton`, Services como `Scoped`.
- Models nunca saem da API diretamente. Usar DTOs de entrada (`...Request`) e de saída (`...Response`).
- A password nunca é guardada nem devolvida em texto.
- A regra de sobreposição de reservas existe **num único método** e é reutilizada.
- Datas de reserva em `DateOnly`.

## Áreas e donos

| Área | Dono | Pastas e ficheiros principais |
| --- | --- | --- |
| Utilizadores e autenticação | Pedro | `User`, `AuthService`, `AuthController` |
| Carros | Rodrigo | `Car`, seed, `CarService`, `CarsController` |
| Reservas | Bruno | `Reservation`, `ReservationService`, `ReservationsController` |
| Frontend, arquitetura e integração | Leandro | `Program.cs`, `Exceptions/`, `frontend/` |

Ao trabalhar na área de outra pessoa, ou ao mudar um contrato partilhado (interface, Model, DTO), avisar que essa alteração tem de ser combinada com o dono da área.

## Fluxo de trabalho

### 1. Planear primeiro

- Em tarefas com 3 ou mais passos, ou com decisões de arquitetura, apresentar um plano curto antes de escrever código.
- Se algo correr mal, parar e replanear em vez de insistir no caminho errado.

### 2. Verificar antes de dar como feito

- Nunca dar uma tarefa como concluída sem provar que funciona.
- Backend: `dotnet build RentACar.slnx` e `dotnet test RentACar.slnx` sem erros.
- Frontend: `ng build` sem erros.
- Indicar sempre como a pessoa pode testar o que foi feito (pedido no ficheiro `.http`, teste xUnit, ecrã no browser).

### 3. Testes

- Cada pessoa escreve os testes da sua área, em `RentACar/tests/RentACar.Tests`.
- Testar as regras de negócio nos Services, com nomes que descrevem o comportamento, por exemplo `CreateReservation_WhenCarIsAlreadyBooked_ThrowsConflictException`.
- Ao corrigir um erro, escrever primeiro um teste que o mostre.

### 4. Corrigir erros

- Perante um erro: ler a mensagem, encontrar a causa raiz e explicar a causa antes de propor a correção.
- Sem soluções temporárias. Se a correção parecer um remendo, procurar a solução simples e correta.

## Princípios

- **Simplicidade primeiro:** cada alteração o mais simples possível.
- **Impacto mínimo:** mexer só no necessário para a tarefa.
- **Explicável:** se a pessoa não conseguir explicar o código ao formador, o código ainda não está pronto.
