using System;
using RentACar.Api.Models;

namespace RentACar.Api.Repositories
{
    public interface IReservationRepository
    {
        List<Reservation> GetAll();
        
        Reservation? GetById(int id);
        void AddReservation(Reservation reservation);
    }
}

