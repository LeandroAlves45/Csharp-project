
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

        public bool IsCarAvailable(
            int carId,
            DateOnly startDate,
            DateOnly endDate)
        {
            var existingReservations = _reservationRepository.GetAll();

            foreach (Reservation existing in existingReservations)
            {
                if (existing.CarId == carId &&
                    existing.Status == ReservationStatus.Active &&
                    startDate < existing.EndDate &&
                    endDate > existing.StartDate)
                {
                    return false;
                }
            }

            return true;
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
