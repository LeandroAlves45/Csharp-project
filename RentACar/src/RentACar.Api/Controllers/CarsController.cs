using Microsoft.AspNetCore.Mvc;
using RentACar.Api.DTOs;
using RentACar.Api.Services;

namespace RentACar.Api.Controllers
{
    // Controller fino: só lê os parâmetros do pedido e chama o CarService.
    // A disponibilidade por datas (R3) é calculada no service, não aqui.
    [ApiController]
    [Route("api/cars")]
    public class CarsController : ControllerBase
    {
        private readonly CarService _carService;

        public CarsController(CarService carService)
        {
            _carService = carService;
        }

        // GET: api/cars
        // GET: api/cars?startDate=2026-12-01&endDate=2026-12-05
        [HttpGet]
        // Sem datas devolve a frota toda; com datas só os carros livres nesse intervalo.
        // DateOnly? (opcional): o ASP.NET Core converte "2026-12-01" da query string
        public ActionResult<List<CarResponse>> GetAllCars(
            [FromQuery] DateOnly? startDate,
            [FromQuery] DateOnly? endDate)
        {
            var cars = _carService.GetAllCars(startDate, endDate);

            return Ok(cars);
        }

        // GET: api/cars/1/availability?startDate=2026-12-01&endDate=2026-12-03
        [HttpGet("{id:int}/availability")]
        // Usado pela janela de reserva do frontend para dizer "disponível" ou "ocupado" antes de confirmar
        public ActionResult<CarAvailabilityResponse> GetAvailability(
            int id,
            [FromQuery] DateOnly? startDate,
            [FromQuery] DateOnly? endDate)
        {
            var result = _carService.GetAvailability(id, startDate, endDate);

            if (result == null)
            {
                // O service devolve null quando o id não existe; o controller traduz isso para 404
                return NotFound("Carro não encontrado.");
            }

            return Ok(result);
        }

        // GET: api/cars/1
        [HttpGet("{id:int}")]
        public ActionResult<CarResponse> GetCarById(int id)
        {
            var car = _carService.GetCarById(id);

            if (car == null)
            {
                return NotFound("Carro não encontrado.");
            }

            return Ok(car);
        }
    }
}