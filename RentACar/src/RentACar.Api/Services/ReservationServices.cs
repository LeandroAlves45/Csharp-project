using System;
using RentACar.Api.Models;
using RentACar.Api.Repositories;

namespace RentACar.Api.Services
{
    public class ReservationService
    {
        private readonly IReservationRepository _reservationRepository;
        private readonly ICarRepository _carRepository;
        private readonly UserRepository _userRepository;

        public ReservationService(IReservationRepository reservationRepository, ICarRepository carRepository, UserRepository userRepository)
        {
            _reservationRepository = reservationRepository;
            _carRepository = carRepository;
            _userRepository = userRepository;
        }

        public List<Reservation> GetReservationsByUser(int userId)
        {
            var reservas = _reservationRepository.GetAll();

            var reservasDoUtilizador = reservas
                .Where(r => r.UserId == userId)
                .ToList();

            return reservasDoUtilizador;
        }

        public bool IsCarAvailable(int carId, DateOnly startDate, DateOnly endDate)
        {
            var reservasExistentes = _reservationRepository.GetAll();

            foreach (Reservation existing in reservasExistentes)
            {
                if (existing.CarId == carId &&
                    existing.Status == ReservationStatus.Active &&
                    startDate <= existing.EndDate &&
                    endDate >= existing.StartDate)
                {
                    return false;
                }
            }

            return true;
        }
        public void CreateReservation(Reservation reservation)
        {

            var reservasExistentes = _reservationRepository.GetAll();

            var car = _carRepository.GetById(reservation.CarId);

            if (car == null)
            {
                throw new ArgumentException("O carro selecionado não existe.");
            }

            var user = _userRepository.GetById(reservation.UserId);
            
            reservation.CancelledAt = null; // Garantir que a propriedade CancelledAt seja nula ao criar uma nova reserva
      
            if (user == null)
            {
                throw new ArgumentException("O usuário selecionado não existe.");
            }

            if (reservation.StartDate < DateOnly.FromDateTime(DateTime.Today))
            {
                throw new ArgumentException("A data de inicio não pode ser no passado.");
            }

            if (reservation.EndDate <= reservation.StartDate)
            {
                throw new ArgumentException("A data de fim não pode ser antes da data de inicio.");
            }

            if (reservation.EndDate.DayNumber - reservation.StartDate.DayNumber > 30)
            {
                throw new ArgumentException("A reserva não pode exceder 30 dias.");
            }
                if (!IsCarAvailable(reservation.CarId, reservation.StartDate, reservation.EndDate))
                {
                    throw new ArgumentException("O carro não está disponível para estas datas.");
                }


                reservation.TotalPrice = car.DailyPrice * (reservation.EndDate.DayNumber - reservation.StartDate.DayNumber); // Cálculo do preco total com base no preço diário do carro e na duração da reserva

            reservation.Status = ReservationStatus.Active;

            reservation.CreatedAt = DateTime.Now;

            reservation.Id = reservasExistentes.Count == 0 ? 1 : reservasExistentes.Max(r => r.Id) + 1;


            _reservationRepository.AddReservation(reservation);
        }

        public void CancelReservation(int reservationId, int userId)
        {
            var reservation = _reservationRepository.GetById(reservationId);
            if (reservation == null)
            {
                throw new ArgumentException("A reserva não existe.");
            }
            if (reservation.UserId != userId)
            {
                throw new ArgumentException("O usuário não tem permissão para cancelar esta reserva.");
            }
            if (reservation.Status == ReservationStatus.Cancelled)
            {
                throw new ArgumentException("A reserva já foi cancelada.");
            }
           
            if(reservation.StartDate <= DateOnly.FromDateTime(DateTime.Today))
            {
                throw new ArgumentException("A reserva não pode ser cancelada após a data de inicio.");
            }


        reservation.Status = ReservationStatus.Cancelled;
            reservation.CancelledAt = DateTime.Now;
        }

    }
}
    