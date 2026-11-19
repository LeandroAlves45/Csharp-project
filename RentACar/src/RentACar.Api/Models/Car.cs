namespace RentACar.Api.Models
{
    public class Car
    {
        public int Id { get; set; }

        public string Brand { get; set; }

        public string Model { get; set; }

        public string LicensePlate { get; set; }

        public string Category { get; set; }

        public decimal DailyPrice { get; set; }
        
        public string Image {  get; set; }
    }
}