using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using RentACar.Api.Services;
using RentACar.Api.Models;

namespace RentACar.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationsController : ControllerBase
    {
        private readonly ReservationService _reservationService;

        public ReservationsController(ReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        [HttpPost]
        public IActionResult CreateReservation([FromBody] Reservation reservation)
        {
            _reservationService.CreateReservation(reservation);
            return StatusCode(201, reservation);
        }

        [HttpGet]
        public IActionResult GetReservationsByUser([FromQuery] int userId)
        {
            var reservas = _reservationService.GetReservationsByUser(userId);

            return Ok(reservas);
        }

        [HttpPost("{id}/cancel")]
        public IActionResult CancelReservation(int id, [FromQuery] int userId)
        {
            _reservationService.CancelReservation(id, userId);
            return Ok();
        }
    }
}
