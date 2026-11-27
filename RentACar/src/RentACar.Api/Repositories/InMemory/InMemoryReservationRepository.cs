using System;
using RentACar.Api.Models;
using RentACar.Api.Repositories;

namespace RentACar.Api.Repositories.InMemory
{
    // Reservas numa List em memória. Singleton no Program.cs: a lista sobrevive entre pedidos
    // (perde-se quando a API reinicia)
    public class InMemoryReservationRepository : IReservationRepository
    {
        private readonly List<Reservation> _reservations;
        public InMemoryReservationRepository()
        {
            _reservations = new List<Reservation>();
        }
        public List<Reservation> GetAll()
        {
            // Devolve uma cópia da lista: quem a recebe não consegue adicionar ou remover reservas por engano
            return new List<Reservation>(_reservations);
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
