using RentACar.Api.Models;

namespace RentACar.Api.Repositories
{
    public interface ICarRepository
    {
        List<Car> GetAll();

        Car? GetById(int id);
    }
}