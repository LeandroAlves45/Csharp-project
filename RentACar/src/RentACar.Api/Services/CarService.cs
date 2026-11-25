using RentACar.Api.DTOs;
using RentACar.Api.Models;
using RentACar.Api.Repositories;
using RentACar.Api.Exceptions;

namespace RentACar.Api.Services
{
    public class CarService
    {
        private readonly ICarRepository _carRepository;
        private readonly IReservationRepository _reservationRepository;

        public CarService(
            ICarRepository carRepository,
            IReservationRepository reservationRepository)
        {
            _carRepository = carRepository;
            _reservationRepository = reservationRepository;
        }

        public List<CarResponse> GetAllCars(DateOnly? startDate, DateOnly? endDate)
        {
            var cars = _carRepository.GetAll();

            if (startDate == null && endDate == null)
            {
                return cars.Select(MapToResponse).ToList();
            }

            if (startDate == null || endDate == null)
            {
                throw new BadRequestException(
                    "É necessário indicar a data de início e a data de fim.");
            }

            if (endDate < startDate)
            {
                throw new BadRequestException(
                    "A data de fim não pode ser anterior à data de início.");
            }

            var reservations = _reservationRepository.GetAll();

            var availableCars = cars
                .Where(car => !reservations.Any(r =>
                    r.CarId == car.Id &&
                    r.Status == ReservationStatus.Active &&
                    startDate <= r.EndDate &&
                    endDate >= r.StartDate
                ))
                .Select(MapToResponse)
                .ToList();

            return availableCars;
        }

        public CarResponse? GetCarById(int id)
        {
            var car = _carRepository.GetById(id);

            return car == null ? null : MapToResponse(car);
        }

        private static CarResponse MapToResponse(Car car)
        {
            return new CarResponse
            {
                Id = car.Id,
                Brand = car.Brand,
                Model = car.Model,
                LicensePlate = car.LicensePlate,
                Category = car.Category,
                DailyPrice = car.DailyPrice,
                ImageUrl = car.ImageUrl
            };
        }
    }
}