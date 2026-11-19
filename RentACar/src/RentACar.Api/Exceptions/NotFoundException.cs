namespace RentACar.Api.Exceptions;

// Carro, utilizador ou reserva inexistente (R1). Vira 404.
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }
}
