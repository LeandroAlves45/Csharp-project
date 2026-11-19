
using RentACar.Api.Repositories;
using RentACar.Api.Repositories.InMemory;
using RentACar.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// User- Injeção das Dependências para o UserRepository e AuthService
builder.Services.AddSingleton<UserRepository, MemoryUserRepository>();
builder.Services.AddScoped<AuthService, AuthServiceUI>();

// Reservation - Dependências das reservas
builder.Services.AddSingleton<IReservationRepository, InMemoryReservationRepository>();
builder.Services.AddScoped<ReservationService>();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
