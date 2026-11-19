
using RentACar.Api.Models;
using RentACar.Api.Repositories;

namespace RentACar.Api.Services
{
    public class CarService
    {
        private readonly ICarRepository _carRepository;

        public CarService(ICarRepository carRepository)
        {
            _carRepository = carRepository;
        }

        public List<Car> GetAllCars()
        {
            return _carRepository.GetAll();
        }

        public Car? GetCarById(int id)
        {
            return _carRepository.GetById(id);
        }
    }
}
