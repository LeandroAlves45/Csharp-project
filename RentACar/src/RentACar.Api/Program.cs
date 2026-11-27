using RentACar.Api.Exceptions;
using RentACar.Api.Repositories;
using RentACar.Api.Repositories.InMemory;
using RentACar.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Ativa os Controllers: cada classe em Controllers/ passa a responder a pedidos HTTP
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Erros em ProblemDetails: o handler global converte as nossas exceções no código HTTP certo
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// CORS: o browser só deixa o Angular (localhost:4200) ler respostas de outra origem
// se a API o autorizar. Só esta origem: qualquer outro site continua bloqueado.
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

// User- Injeção das Dependências para o UserRepository e AuthService
// Utilizadores: repositório Singleton para a lista sobreviver entre pedidos;
// service Scoped (um por pedido)
builder.Services.AddSingleton<UserRepository, MemoryUserRepository>();
builder.Services.AddScoped<AuthService, AuthServiceUI>();

// Reservation - Dependências das reservas
builder.Services.AddSingleton<IReservationRepository, InMemoryReservationRepository>();
builder.Services.AddScoped<ReservationServices>();

// Carros: mesma lógica de tempos de vida.
// CarService fica registado como classe concreta até o Rodrigo criar o ICarService
builder.Services.AddSingleton<ICarRepository, InMemoryCarRepository>();
builder.Services.AddScoped<CarService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Primeiro do pipeline: assim apanha exceções vindas de tudo o que corre depois dele
app.UseExceptionHandler();

// Pedidos http passam para https (o frontend usa sempre https://localhost:7215)
app.UseHttpsRedirection();
// Serve os ficheiros de wwwroot/ (as fotografias dos carros em /images/cars)
app.UseStaticFiles();

// Tem de vir antes de UseAuthorization e MapControllers, para os cabeçalhos CORS
// (e a resposta ao preflight OPTIONS) serem tratados antes de chegar aos controllers.
app.UseCors("Frontend");
app.UseAuthorization();

app.MapControllers();

app.Run();
