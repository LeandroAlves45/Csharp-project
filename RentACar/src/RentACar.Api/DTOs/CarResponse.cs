namespace RentACar.Api.DTOs
{
    public class CarResponse
    {
        public int Id { get; set; }
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal DailyPrice { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
    }
}