namespace RentACar.Api.Exceptions;

// Credenciais erradas no login. Vira 401.
public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message) : base(message)
    {
    }
}
