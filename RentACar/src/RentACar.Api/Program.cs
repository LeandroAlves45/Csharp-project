
using RentACar.Api.Repositories;
using RentACar.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// User- Injeção das Dependências para o UserRepository e AuthService
builder.Services.AddSingleton<UserRepository, MemoryUserRepository>();
builder.Services.AddScoped<AuthService, AuthServiceUI>();

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
