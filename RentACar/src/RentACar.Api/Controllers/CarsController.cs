using Microsoft.AspNetCore.Mvc;
using RentACar.Api.DTOs;
using RentACar.Api.Services;

namespace RentACar.Api.Controllers
{
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
        public ActionResult<List<CarResponse>> GetAllCars(
            [FromQuery] DateOnly? startDate,
            [FromQuery] DateOnly? endDate)
        {
            var cars = _carService.GetAllCars(startDate, endDate);

            return Ok(cars);
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