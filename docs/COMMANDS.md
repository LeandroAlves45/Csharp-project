# Comandos do RentACar

Este ficheiro junta os comandos que vamos usar no dia a dia, com uma explicação de cada um. Os comandos são para **PowerShell no Windows**.

Convenção: cada secção diz em que pasta se corre o comando. Quando não diz nada, corre-se na **raiz do repositório**, a pasta onde está o `RentACar.slnx`.

Endereços da API em desenvolvimento (definidos em `RentACar/src/RentACar.Api/Properties/launchSettings.json`):

| Perfil | Endereço |
| --- | --- |
| `https` | `https://localhost:7215` (e `http://localhost:5288`) |
| `http` | `http://localhost:5288` |
| Angular (`ng serve`) | `http://localhost:4200` |

## 1. Preparar o computador (uma vez)

### Confirmar as versões

```powershell
dotnet --list-sdks
node -v
npm -v
ng version
```

- `dotnet --list-sdks` lista os SDKs .NET instalados. Tem de aparecer uma versão `10.x`.
- `node -v` e `npm -v` mostram as versões do Node.js e do npm, de que o Angular precisa. Instalar a versão LTS de nodejs.org.
- `ng version` mostra a versão do Angular CLI. Tem de ser `22.x`.

Enviar o resultado no WhatsApp, para confirmarmos que os quatro têm as mesmas versões major.

### Instalar o Angular CLI

```powershell
npm install -g @angular/cli@22
```

O `-g` instala o comando `ng` para todo o computador, não só para este projeto. O `@22` fixa a versão major, para todos terem a mesma.

Se o PowerShell disser que não pode executar scripts por causa da política de execução, corre uma vez:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Isto permite correr scripts locais, como o `ng.ps1`, só para o teu utilizador.

### Certificado HTTPS de desenvolvimento

```powershell
dotnet dev-certs https --trust
dotnet dev-certs https --check --trust
```

O primeiro cria um certificado local e marca-o como confiável, para o browser aceitar `https://localhost`. O segundo confirma que ficou válido. Só é preciso se o browser reclamar do certificado.

## 2. Git no dia a dia

Cada área tem a sua branch, com o nome da função: `auth` (Pedro), `cars` (Rodrigo), `reservations` (Bruno), `frontend` (Leandro). Ninguém faz push direto para o `main`.

**Versão simples:** o `main` é o caderno passado a limpo da turma. Cada um escreve no seu caderno de rascunho (a sua branch). Quando uma parte está pronta e revista por um colega, passa-se para o caderno limpo (pull request). Todos os dias copiamos para o nosso rascunho o que os outros já passaram a limpo (merge do main).

**Versão técnica:** fluxo com branches de longa duração por área, integração diária do `main` na branch da área para reduzir divergência, e integração no `main` só por pull request revisto.

### Primeira vez (clonar)

```powershell
git clone https://github.com/LeandroAlves45/Csharp-project.git
cd Csharp-project
git checkout <a tua branch>
```

O `clone` copia o repositório do GitHub para o teu computador. O `checkout` muda para a tua branch.

### Começar o dia: trazer o main para a tua branch

```powershell
git checkout main
git pull
git checkout <a tua branch>
git merge main
```

1. Muda para o `main`.
2. Descarrega as alterações do GitHub para o teu `main` local.
3. Volta para a tua branch.
4. Junta o `main` atualizado à tua branch.

Fazer isto **todos os dias** antes de começar. Quanto mais tempo a tua branch passa sem o `main`, maiores são os conflitos.

### Guardar trabalho

```powershell
git status
git add .
git commit -m "Add car seed data"
git push
```

- `git status` mostra o que mudou. Ler sempre antes do `add`, para não enviar ficheiros que não querias.
- `git add .` marca todas as alterações para o próximo commit.
- `git commit -m` guarda um ponto na história, com uma mensagem curta em inglês a dizer o que muda.
- `git push` envia os commits para o GitHub. Na primeira vez numa branch nova: `git push -u origin <a tua branch>`.

### Ver diferenças sem alterar nada

```powershell
git diff
git diff --stat
git log --oneline
```

- `git diff` mostra as linhas alteradas e ainda não adicionadas.
- `git diff --stat` mostra só que ficheiros mudaram e quantas linhas.
- `git log --oneline` mostra a história, um commit por linha.

### Desfazer um git add antes do commit

```powershell
git restore --staged .
```

Tira os ficheiros da lista do próximo commit. **Não apaga** as alterações dos ficheiros.

### Abrir um pull request

1. `dotnet build RentACar.slnx` e `dotnet test RentACar.slnx` sem erros.
2. `git push` da tua branch.
3. No GitHub: Pull requests, New pull request, base `main`, compare `<a tua branch>`.
4. Na descrição, escrever o que muda e a issue que fecha (`Closes #12`).
5. Pedir revisão a um colega. Só se faz merge depois da aprovação.

### Quando há conflito no merge

Um conflito acontece quando duas pessoas mudaram as mesmas linhas. O Git marca o ficheiro assim:

```text
<<<<<<< HEAD
a tua versão
=======
a versão que vem do main
>>>>>>> main
```

1. Abrir o ficheiro (o Visual Studio e o VS Code mostram botões para escolher).
2. Ficar com a versão certa, ou juntar as duas, e apagar as marcas `<<<<<<<`, `=======` e `>>>>>>>`.
3. Compilar e correr os testes.
4. `git add .` e `git commit` para concluir o merge.

Se tiveres dúvidas sobre o código do outro, pergunta-lhe antes de escolher.

## 3. Backend: compilar, testar e correr

### Restaurar pacotes

```powershell
dotnet restore RentACar.slnx
```

Descarrega os pacotes NuGet de que os projetos precisam. O `build` já faz isto sozinho, mas é útil quando há erros de pacotes.

### Compilar

```powershell
dotnet build RentACar.slnx
```

Compila a API e os testes. Correr **sempre** antes de um commit e de um pull request.

### Correr os testes

```powershell
dotnet test RentACar.slnx
```

Corre todos os testes xUnit. Têm de passar todos antes de um pull request.

Correr só os testes de uma área (o filtro procura no nome completo do teste):

```powershell
dotnet test RentACar.slnx --filter "FullyQualifiedName~Reservation"
dotnet test RentACar.slnx --filter "FullyQualifiedName~Auth"
dotnet test RentACar.slnx --filter "FullyQualifiedName~Car"
```

Ver o detalhe de cada teste:

```powershell
dotnet test RentACar.slnx --logger "console;verbosity=detailed"
```

### Correr a API

```powershell
dotnet run --project RentACar/src/RentACar.Api/RentACar.Api.csproj --launch-profile https
```

Arranca a API com o perfil `https` do `launchSettings.json`. Para parar: `Ctrl + C`.

Com a API a correr, o documento OpenAPI está em `https://localhost:7215/openapi/v1.json`. Se aparecer um JSON, a API arrancou bem.

### Correr com hot reload

```powershell
dotnet watch run --project RentACar/src/RentACar.Api/RentACar.Api.csproj --launch-profile https
```

Igual ao anterior, mas recompila sozinho quando gravas um ficheiro. Algumas alterações (por exemplo no `Program.cs`) obrigam a reiniciar. O próprio `dotnet watch` avisa.

### Testar endpoints no Visual Studio

Abrir `RentACar/src/RentACar.Api/RentACar.Api.http`, escrever os pedidos e carregar em "Send Request" por cima de cada um. Exemplo:

```http
@RentACar.Api_HostAddress = http://localhost:5288

GET {{RentACar.Api_HostAddress}}/api/cars?startDate=2026-12-01&endDate=2026-12-05
Accept: application/json

###

POST {{RentACar.Api_HostAddress}}/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123"
}
```

Os pedidos são separados por `###`. Cada pessoa acrescenta os pedidos dos seus endpoints.

### Pacotes NuGet

```powershell
dotnet list RentACar.slnx package
dotnet add RentACar/src/RentACar.Api/RentACar.Api.csproj package <NomeDoPacote>
```

- O primeiro lista os pacotes de cada projeto.
- O segundo adiciona um pacote à API.

Regra da equipa: **ninguém adiciona um pacote sem combinar antes no WhatsApp**. Cada pacote novo é algo que todos têm de saber explicar.

## 4. Frontend (Angular)

### Criar o projeto (só o Leandro, uma vez, no Sprint 2)

Na raiz do repositório:

```powershell
ng new rentacar-web --directory frontend --style css --ssr false --routing --skip-git --ai-config none
```

- `--directory frontend` cria o projeto dentro da pasta `frontend` que já existe.
- `--style css` usa CSS simples.
- `--ssr false` desliga a renderização no servidor, que não precisamos.
- `--routing` cria o ficheiro de rotas.
- `--skip-git` não cria um repositório Git novo, porque o projeto já está dentro do nosso.
- `--ai-config none` não gera ficheiros de configuração para ferramentas de IA.

Se aparecer mais alguma pergunta, aceitar o valor por omissão.

### Instalar dependências (depois de clonar ou de um pull com alterações no frontend)

Na pasta `frontend`:

```powershell
cd frontend
npm ci
```

O `npm ci` instala exatamente as versões do `package-lock.json`, para todos terem as mesmas. Usar `npm ci` e não `npm install`, que pode mudar o `package-lock.json`.

### Correr, compilar e testar

Na pasta `frontend`:

| Objetivo | Comando | Explicação |
| --- | --- | --- |
| Servidor de desenvolvimento | `ng serve` | Abre em `http://localhost:4200` e recarrega ao gravar |
| Build | `ng build` | Gera a versão final em `dist/` e mostra erros de compilação |
| Testes | `ng test` | Corre os testes do frontend (o Angular 22 usa Vitest por omissão) |

Para o frontend falar com a API, as duas têm de estar a correr ao mesmo tempo, em dois terminais.

### Gerar código

Na pasta `frontend`:

```powershell
ng generate component pages/login
ng generate service core/services/auth
```

- O primeiro cria um componente (ficheiros `.ts`, `.html`, `.css` e de teste) em `src/app/pages/login`.
- O segundo cria um serviço em `src/app/core/services`.

## 5. Problemas comuns

| Problema | Causa provável | Solução |
| --- | --- | --- |
| `Failed to bind to address ... address already in use` | A API já está a correr noutro terminal ou no Visual Studio | Parar a outra instância com `Ctrl + C` ou fechar o Visual Studio |
| O browser diz que a ligação não é segura | Certificado de desenvolvimento em falta | `dotnet dev-certs https --trust` |
| Erros de ficheiros bloqueados no build | O Visual Studio tem o projeto aberto e a compilar | Fechar o Visual Studio ou compilar só por lá |
| `NU1301` ou erros a descarregar pacotes | Sem internet ou proxy | Verificar a ligação e correr `dotnet restore RentACar.slnx` |
| O Angular dá erro de CORS na consola do browser | O backend não permite pedidos de `http://localhost:4200` | Confirmar a configuração de CORS no `Program.cs` |
| `ng` não é reconhecido | Angular CLI não instalado ou terminal aberto antes da instalação | `npm install -g @angular/cli@22` e abrir um terminal novo |
| A tua branch tem coisas antigas que já estão no `main` | Falta o merge diário | Secção 2, "Começar o dia" |
