namespace RentACar.Api.Exceptions;

// O pedido está bem feito, mas choca com o estado atual do sistema:
// carro ocupado (R3), email já registado, reserva já cancelada (C2), cancelamento tardio (C3). Vira 409.
public class ConflictException : Exception
{
    public ConflictException(string message) : base(message)
    {
    }
}
