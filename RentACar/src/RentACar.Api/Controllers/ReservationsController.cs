
using Microsoft.AspNetCore.Mvc;
using RentACar.Api.Services;
using RentACar.Api.Models;
using RentACar.Api.DTOs;

namespace RentACar.Api.Controllers
{
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

            return StatusCode(201, ToResponse(reservation));
        }

        [HttpGet]
        public IActionResult GetReservationsByUser([FromQuery] int userId)
        {
            var reservations = _reservationService.GetReservationsByUser(userId);

            var response = reservations.Select(r => ToResponse(r)).ToList();

            return Ok(response);
        }

        [HttpPost("{id}/cancel")]
        public IActionResult CancelReservation(int id, [FromQuery] int userId)
        {
            _reservationService.CancelReservation(id, userId);

            return Ok();
        }

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
