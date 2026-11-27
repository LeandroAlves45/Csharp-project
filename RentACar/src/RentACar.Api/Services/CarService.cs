using RentACar.Api.DTOs;
using RentACar.Api.Models;
using RentACar.Api.Repositories;
using RentACar.Api.Exceptions;

namespace RentACar.Api.Services
{
    // Regras dos carros: listar, filtrar por disponibilidade e converter para DTO.
    // Usa o ReservationServices para saber se um carro está livre: a regra de
    // sobreposição fica num único sítio (DRY) e não é copiada para aqui.
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

            // Sem datas: a frota toda (ecrã inicial do frontend)
            if (startDate == null && endDate == null)
                return cars.Select(MapToResponse).ToList();

            var (start, end) = ValidateDates(startDate, endDate);

            // Com datas: só os carros sem reserva ativa nesse intervalo (R3)
            return cars
                .Where(car => _reservationService.IsCarAvailable(car.Id, start, end))
                .Select(MapToResponse)
                .ToList();
        }

        // Disponibilidade de um só carro; null quando o carro não existe (o controller devolve 404)
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

        // Devolve as duas datas já sem "?" (tuplo), ou lança 400 se faltar alguma ou estiverem trocadas
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

        // Converte o Model no DTO de saída: a API nunca devolve o Model diretamente
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