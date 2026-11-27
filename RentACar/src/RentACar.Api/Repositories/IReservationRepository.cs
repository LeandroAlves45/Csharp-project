using System;
using RentACar.Api.Models;

namespace RentACar.Api.Repositories
{
    // Só leitura e escrita das reservas: as regras estão no ReservationServices
    public interface IReservationRepository
    {
        List<Reservation> GetAll();
        
        Reservation? GetById(int id);
        void AddReservation(Reservation reservation);
    }
}

