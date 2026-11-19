using RentACar.Api.DTOs;

namespace RentACar.Api.Services
{
    public interface AuthService
    {
        UserResponse SignIn(SignIn signIn);
        UserResponse Login(Login login);
    }
}