namespace RentACar.Api.Exceptions;

// Sabemos quem é, mas não pode fazer isto (cancelar a reserva de outra pessoa, C1). Vira 403.
public class ForbiddenException : Exception
{
    public ForbiddenException(string message) : base(message)
    {
    }
}
