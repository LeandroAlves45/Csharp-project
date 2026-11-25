using System;

namespace RentACar.Api.DTOs;


public class CreateReservationDto
{
    public int UserId { get; set; }
    public int CarId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; } 

}
