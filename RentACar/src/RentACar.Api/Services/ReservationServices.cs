
using System;
using System.Collections.Generic;
using System.Linq;
using RentACar.Api.Models;
using RentACar.Api.Repositories;
using RentACar.Api.Exceptions;

namespace RentACar.Api.Services
{
    public class ReservationServices
    {
        private readonly IReservationRepository _reservationRepository;
        private readonly ICarRepository _carRepository;
        private readonly UserRepository _userRepository;

        public ReservationServices(
            IReservationRepository reservationRepository,
            ICarRepository carRepository,
            UserRepository userRepository)
        {
            _reservationRepository = reservationRepository;
            _carRepository = carRepository;
            _userRepository = userRepository;
        }

        public List<Reservation> GetReservationsByUser(int userId)
        {
            var reservations = _reservationRepository.GetAll();

            return reservations
                .Where(r => r.UserId == userId)
                .ToList();
        }

        public static bool DatesOverlap(
            DateOnly start1,
            DateOnly end1,
            DateOnly start2,
            DateOnly end2)
        {
            return start1 < end2 && start2 < end1;
        }

        // Carro não pode ter outra reserva ativa nessas datas.
        // AddDays(1) nas duas reservas: o dia de devolução fica bloqueado para limpeza.
        // Se uma reserva acaba a 10, a próxima deste carro só pode começar a 11
        // (e uma reserva nova que acabe a 10 não pode ter outra a começar a 10).

        public bool IsCarAvailable(
            int carId,
            DateOnly startDate,
            DateOnly endDate)
        {
            return !_reservationRepository.GetAll()
                .Any(existing => existing.CarId == carId &&
                    existing.Status == ReservationStatus.Active &&
                    DatesOverlap(
                        startDate,
                        endDate.AddDays(1),
                        existing.StartDate,
                        existing.EndDate.AddDays(1)));
        }

        // O mesmo utilizador não pode ter dois carros ao mesmo tempo.
        // Sem o dia extra de limpeza: a pessoa pode devolver um carro e levantar outro no mesmo dia.
        public bool UserHasReservationInDates(
            int userId,
            DateOnly startDate,
            DateOnly endDate)
        {
            return _reservationRepository.GetAll()
                .Any(existing => existing.UserId == userId &&
                    existing.Status == ReservationStatus.Active &&
                    DatesOverlap(
                        startDate,
                        endDate,
                        existing.StartDate,
                        existing.EndDate));
        }

        public void CreateReservation(Reservation reservation)
        {
            var car = _carRepository.GetById(reservation.CarId);

            if (car == null)
            {
                throw new NotFoundException(
                    "O carro selecionado não existe.");
            }

            var user = _userRepository.GetById(reservation.UserId);

            if (user == null)
            {
                throw new NotFoundException(
                    "O utilizador selecionado não existe.");
            }

            if (reservation.StartDate <
                DateOnly.FromDateTime(DateTime.Today))
            {
                throw new BadRequestException(
                    "A data de início não pode estar no passado.");
            }

            // Só a partir de amanhã. O carro precisa de ser preparado e,
            // pela regra C3, uma reserva para hoje nunca poderia ser cancelada.
            if (reservation.StartDate <=
                DateOnly.FromDateTime(DateTime.Today))
            {
                throw new BadRequestException(
                    "A data de início tem de ser a partir de amanhã.");
            }

            if (reservation.EndDate <= reservation.StartDate)
            {
                throw new BadRequestException(
                    "A data de fim tem de ser posterior à data de início.");
            }

            int rentalDays =
                reservation.EndDate.DayNumber -
                reservation.StartDate.DayNumber;

            if (rentalDays > 30)
            {
                throw new BadRequestException(
                    "A reserva não pode exceder 30 dias.");
            }

            if (!IsCarAvailable(
                reservation.CarId,
                reservation.StartDate,
                reservation.EndDate))
            {
                throw new ConflictException(
                    "O carro não está disponível para estas datas.");
            }

            if (UserHasReservationInDates(
                reservation.UserId,
                reservation.StartDate,
                reservation.EndDate))
            {
                throw new ConflictException(
                    "Não é possível ter dois carros reservados para as mesmas datas.");
            }

            var existingReservations =
                _reservationRepository.GetAll();

            reservation.TotalPrice = car.DailyPrice * rentalDays;
            reservation.Status = ReservationStatus.Active;
            reservation.CreatedAt = DateTime.Now;
            reservation.CancelledAt = null;

            reservation.Id = existingReservations.Count == 0
                ? 1
                : existingReservations.Max(r => r.Id) + 1;

            _reservationRepository.AddReservation(reservation);
        }

        public void CancelReservation(int reservationId, int userId)
        {
            var reservation =
                _reservationRepository.GetById(reservationId);

            if (reservation == null)
            {
                throw new NotFoundException(
                    "A reserva não existe.");
            }

            if (reservation.UserId != userId)
            {
                throw new ForbiddenException(
                    "O utilizador não tem permissão para cancelar esta reserva.");
            }

            if (reservation.Status == ReservationStatus.Cancelled)
            {
                throw new ConflictException(
                    "A reserva já foi cancelada.");
            }

            if (reservation.StartDate <=
                DateOnly.FromDateTime(DateTime.Today).AddDays(1))
            {
                throw new ConflictException(
                    "A reserva não pode ser cancelada no dia anterior ou no próprio dia de início.");
            }

            reservation.Status = ReservationStatus.Cancelled;
            reservation.CancelledAt = DateTime.Now;
        }
    }
}
