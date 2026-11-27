
using System;

namespace RentACar.Api.Models
{
    // Entidade interna da reserva. Sai da API sempre como ReservationResponse (DTO)
    public class Reservation
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public int CarId { get; set; }

        // DateOnly: o aluguer é ao dia, não precisamos de horas nem de fusos horários
        public DateOnly StartDate { get; set; }

        public DateOnly EndDate { get; set; }

        // Calculado pelo servidor ao criar a reserva (R5)
        public decimal TotalPrice { get; set; }

        public ReservationStatus Status { get; set; }

        public DateTime CreatedAt { get; set; }

        // null enquanto a reserva está ativa
        public DateTime? CancelledAt { get; set; }
    }
}
