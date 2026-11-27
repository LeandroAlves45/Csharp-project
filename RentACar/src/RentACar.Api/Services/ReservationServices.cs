
using System;
using System.Collections.Generic;
using System.Linq;
using RentACar.Api.Models;
using RentACar.Api.Repositories;
using RentACar.Api.Exceptions;

namespace RentACar.Api.Services
{
    // Todas as regras das reservas (R1 a R6, C1 a C3) estão aqui, e só aqui.
    // Não sabe nada de HTTP: quando uma regra falha, lança uma das nossas exceções
    // e o GlobalExceptionHandler escolhe o código (400, 403, 404, 409).
    public class ReservationServices
    {
        private readonly IReservationRepository _reservationRepository;
        private readonly ICarRepository _carRepository;
        private readonly UserRepository _userRepository;

        // Recebe os repositórios por injeção de dependências (registados no Program.cs)
        public ReservationServices(
            IReservationRepository reservationRepository,
            ICarRepository carRepository,
            UserRepository userRepository)
        {
            _reservationRepository = reservationRepository;
            _carRepository = carRepository;
            _userRepository = userRepository;
        }

        // Histórico de um utilizador: todas as reservas dele, ativas e canceladas
        public List<Reservation> GetReservationsByUser(int userId)
        {
            var reservations = _reservationRepository.GetAll();

            return reservations
                .Where(r => r.UserId == userId)
                .ToList();
        }

        // A regra de sobreposição num único método (DRY), usada para o carro (R3) e para o utilizador (R6).
        // Intervalos [início, fim[: o dia de fim não conta, por isso uma reserva que acaba a 10
        // e outra que começa a 10 não se sobrepõem. Dois intervalos cruzam-se quando cada um
        // começa antes de o outro acabar.
        public static bool DatesOverlap(
            DateOnly start1,
            DateOnly end1,
            DateOnly start2,
            DateOnly end2)
        {
            return start1 < end2 && start2 < end1;
        }

        // R3: o carro não pode ter outra reserva ativa nessas datas.
        // AddDays(1) nas duas reservas: o dia de devolução fica bloqueado para limpeza.
        // Se uma reserva acaba a 10, a próxima deste carro só pode começar a 11
        // (e uma reserva nova que acabe a 10 não pode ter outra a começar a 10).
        // As canceladas não contam: o carro volta a ficar livre.
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

        // R6: o mesmo utilizador não pode ter dois carros ao mesmo tempo.
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

        // As validações vão da mais simples à mais cara: primeiro se existe (R1),
        // depois as datas (R2, R4) e só no fim as sobreposições (R3, R6)
        public void CreateReservation(Reservation reservation)
        {
            // R1: o carro e o utilizador têm de existir (404)
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

            // R2: nada no passado (400); a seguir, também não para hoje
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

            // R2: o fim tem de ser depois do início (pelo menos 1 dia cobrado)
            if (reservation.EndDate <= reservation.StartDate)
            {
                throw new BadRequestException(
                    "A data de fim tem de ser posterior à data de início.");
            }

            // DayNumber conta dias desde uma data fixa: a diferença dá os dias cobrados (R5)
            int rentalDays =
                reservation.EndDate.DayNumber -
                reservation.StartDate.DayNumber;

            // R4: no máximo 30 dias
            if (rentalDays > 30)
            {
                throw new BadRequestException(
                    "A reserva não pode exceder 30 dias.");
            }

            // R3: carro ocupado nessas datas (409)
            if (!IsCarAvailable(
                reservation.CarId,
                reservation.StartDate,
                reservation.EndDate))
            {
                throw new ConflictException(
                    "O carro não está disponível para estas datas.");
            }

            // R6: o utilizador já tem outro carro nessas datas (409)
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

            // R5: o preço é sempre calculado pelo servidor, nunca vem do cliente
            reservation.TotalPrice = car.DailyPrice * rentalDays;
            reservation.Status = ReservationStatus.Active;
            reservation.CreatedAt = DateTime.Now;
            reservation.CancelledAt = null;

            // Id sequencial: o maior id existente + 1 (a lista em memória não gera ids sozinha)
            reservation.Id = existingReservations.Count == 0
                ? 1
                : existingReservations.Max(r => r.Id) + 1;

            _reservationRepository.AddReservation(reservation);
        }

        // Cancelar não apaga a reserva: muda o estado para Cancelled e guarda a data,
        // para o histórico continuar completo
        public void CancelReservation(int reservationId, int userId)
        {
            var reservation =
                _reservationRepository.GetById(reservationId);

            if (reservation == null)
            {
                throw new NotFoundException(
                    "A reserva não existe.");
            }

            // C1: só o dono da reserva a pode cancelar (403)
            if (reservation.UserId != userId)
            {
                throw new ForbiddenException(
                    "O utilizador não tem permissão para cancelar esta reserva.");
            }

            // C2: só reservas ativas (409)
            if (reservation.Status == ReservationStatus.Cancelled)
            {
                throw new ConflictException(
                    "A reserva já foi cancelada.");
            }

            // C3: prazo de cancelamento (409)
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
