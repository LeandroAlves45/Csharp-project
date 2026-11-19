namespace RentACar.Api.Exceptions;

// Dados do pedido inválidos (datas trocadas, mais de 30 dias, campo vazio). Vira 400.
public class BadRequestException : Exception
{
    public BadRequestException(string message) : base(message)
    {
    }
}
