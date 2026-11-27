using System;

namespace RentACar.Api.DTOs;


// Corpo do POST /api/reservations: só o que o cliente pode escolher.
// Id, preço e estado ficam de fora porque são decididos pelo servidor
public class CreateReservationDto
{
    public int UserId { get; set; }
    public int CarId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; } 

}
