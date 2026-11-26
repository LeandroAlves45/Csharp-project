namespace RentACar.Api.DTOs
{
    public class CarAvailabilityResponse
    {
        public int CarId { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public bool Available { get; set; }
    }
}