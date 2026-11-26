using RentACar.Api.DTOs;
using RentACar.Api.Models;
using RentACar.Api.Repositories;
using RentACar.Api.Exceptions;

namespace RentACar.Api.Services
{
    public class CarService
    {
        private readonly ICarRepository _carRepository;
        private readonly ReservationServices _reservationService;

        public CarService(ICarRepository carRepository, ReservationServices reservationService)
        {
            _carRepository = carRepository;
            _reservationService = reservationService;
        }

        public List<CarResponse> GetAllCars(DateOnly? startDate, DateOnly? endDate)
        {
            var cars = _carRepository.GetAll();

            if (startDate == null && endDate == null)
                return cars.Select(MapToResponse).ToList();

            var (start, end) = ValidateDates(startDate, endDate);

            return cars
                .Where(car => _reservationService.IsCarAvailable(car.Id, start, end))
                .Select(MapToResponse)
                .ToList();
        }

        public CarAvailabilityResponse? GetAvailability(int id, DateOnly? startDate, DateOnly? endDate)
        {
            var car = _carRepository.GetById(id);
            if (car == null) return null;

            var (start, end) = ValidateDates(startDate, endDate);

            return new CarAvailabilityResponse
            {
                CarId = car.Id,
                StartDate = start,
                EndDate = end,
                Available = _reservationService.IsCarAvailable(car.Id, start, end)
            };
        }

        private static (DateOnly Start, DateOnly End) ValidateDates(DateOnly? startDate, DateOnly? endDate)
        {
            if (startDate == null || endDate == null)
                throw new BadRequestException("É necessário indicar a data de início e a data de fim.");

            if (endDate <= startDate)
                throw new BadRequestException("A data de fim tem de ser depois da data de início.");

            return (startDate.Value, endDate.Value);
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