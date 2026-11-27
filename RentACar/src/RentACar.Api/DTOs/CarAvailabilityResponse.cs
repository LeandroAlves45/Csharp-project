namespace RentACar.Api.DTOs
{
    // Resposta do GET /api/cars/{id}/availability: o carro está livre nessas datas?
    public class CarAvailabilityResponse
    {
        public int CarId { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public bool Available { get; set; }
    }
}