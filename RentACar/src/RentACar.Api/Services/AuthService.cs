using RentACar.Api.DTOs;

namespace RentACar.Api.Services
{
    // Contrato da autenticação: o controller depende disto e não da implementação (AuthServiceUI)
    public interface AuthService
    {
        UserResponse SignIn(SignIn signIn);
        UserResponse Login(Login login);
    }
}