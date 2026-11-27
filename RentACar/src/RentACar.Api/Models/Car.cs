namespace RentACar.Api.Models
{
    // Entidade interna do carro. Sai da API sempre como CarResponse (DTO)
    public class Car
    {
        public int Id { get; set; }

        public string Brand { get; set; } = string.Empty;

        public string Model { get; set; } = string.Empty;

        public string LicensePlate { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        // decimal e não double: dinheiro precisa de valores exatos (sem erros de arredondamento)
        public decimal DailyPrice { get; set; }

        public string ImageUrl { get; set; } = string.Empty;
    }
}
