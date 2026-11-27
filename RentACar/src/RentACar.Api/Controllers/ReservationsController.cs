
using Microsoft.AspNetCore.Mvc;
using RentACar.Api.Services;
using RentACar.Api.Models;
using RentACar.Api.DTOs;

namespace RentACar.Api.Controllers
{
    // Controller fino: recebe DTOs, chama o ReservationServices e devolve DTOs.
    // Não tem try/catch: as exceções do service (400/403/404/409) são tratadas
    // pelo GlobalExceptionHandler, num único sítio.
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationsController : ControllerBase
    {
        private readonly ReservationServices _reservationService;

        public ReservationsController(ReservationServices reservationService)
        {
            _reservationService = reservationService;
        }

        [HttpPost]
        // POST /api/reservations. Recebe um DTO e não o Model: o cliente não consegue
        // enviar id, preço ou estado, que são decididos pelo servidor (R5)
        public IActionResult CreateReservation([FromBody] CreateReservationDto dto)
        {
            var reservation = new Reservation
            {
                UserId = dto.UserId,
                CarId = dto.CarId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate
            };

            _reservationService.CreateReservation(reservation);

            // 201 Created com a reserva já com id, preço total e estado Active
            return StatusCode(201, ToResponse(reservation));
        }

        [HttpGet]
        // GET /api/reservations?userId=1: histórico do utilizador (ativas e canceladas)
        public IActionResult GetReservationsByUser([FromQuery] int userId)
        {
            var reservations = _reservationService.GetReservationsByUser(userId);

            var response = reservations.Select(r => ToResponse(r)).ToList();

            return Ok(response);
        }

        [HttpPost("{id}/cancel")]
        // POST /api/reservations/{id}/cancel?userId=1. O userId serve para a regra C1 (só o dono cancela).
        // POST e não DELETE: a reserva não é apagada, só muda de estado para Cancelled
        public IActionResult CancelReservation(int id, [FromQuery] int userId)
        {
            _reservationService.CancelReservation(id, userId);

            return Ok();
        }

        // Converte o Model no DTO de saída: o Model nunca sai diretamente da API
        private static ReservationResponse ToResponse(Reservation reservation)
        {
            return new ReservationResponse
            {
                Id = reservation.Id,
                UserId = reservation.UserId,
                CarId = reservation.CarId,
                StartDate = reservation.StartDate,
                EndDate = reservation.EndDate,
                TotalPrice = reservation.TotalPrice,
                Status = reservation.Status,
                CreatedAt = reservation.CreatedAt,
                CancelledAt = reservation.CancelledAt
            };
        }
    }
}
