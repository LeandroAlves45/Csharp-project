using RentACar.Api.Models;

namespace RentACar.Api.Repositories
{
    // Só leitura e escrita dos carros: sem regras de negócio.
    // Os services dependem desta interface, por isso trocar a List por uma base de dados
    // mudava só a implementação
    public interface ICarRepository
    {
        List<Car> GetAll();

        Car? GetById(int id);
    }
}