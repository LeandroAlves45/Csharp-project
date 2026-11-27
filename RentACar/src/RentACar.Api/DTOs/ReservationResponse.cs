using System;

using RentACar.Api.Models;

namespace RentACar.Api.DTOs;

// O que a API devolve de uma reserva (DTO de saída)
public class ReservationResponse
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int CarId { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public decimal TotalPrice { get; set; }

    public ReservationStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? CancelledAt { get; set; }
}
