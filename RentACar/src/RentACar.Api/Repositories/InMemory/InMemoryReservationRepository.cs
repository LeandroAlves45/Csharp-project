using System;
using RentACar.Api.Models;
using RentACar.Api.Repositories;

namespace RentACar.Api.Repositories.InMemory
{
    public class InMemoryReservationRepository : IReservationRepository
    {
        private readonly List<Reservation> _reservations;
        public InMemoryReservationRepository()
        {
            _reservations = new List<Reservation>();
        }
        public List<Reservation> GetAll()
        {
            return _reservations;
        }
        public Reservation? GetById(int id)
        {
            return _reservations.FirstOrDefault(r => r.Id == id);
        }
        public void AddReservation(Reservation reservation)
        {
            _reservations.Add(reservation);
        }
    }
}
