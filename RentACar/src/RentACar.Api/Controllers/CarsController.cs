
using Microsoft.AspNetCore.Mvc;
using RentACar.Api.Models;
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
        [HttpGet]
        public ActionResult<List<Car>> GetAllCars()
        {
            var cars = _carService.GetAllCars();

            return Ok(cars);
        }

        // GET: api/cars/1
        [HttpGet("{id:int}")]
        public ActionResult<Car> GetCarById(int id)
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
