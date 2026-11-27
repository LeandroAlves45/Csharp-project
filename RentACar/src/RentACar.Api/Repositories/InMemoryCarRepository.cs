
using RentACar.Api.Data;
using RentACar.Api.Models;

namespace RentACar.Api.Repositories
{
	// Carros numa List em memória, carregados do SeedData.
	// Registado como Singleton: a mesma lista para todos os pedidos
	public class InMemoryCarRepository : ICarRepository
	{
		private readonly List<Car> _cars;

		public InMemoryCarRepository()
		{
			_cars = SeedData.GetCars();
		}

		public List<Car> GetAll()
		{
			return _cars;
		}

		public Car? GetById(int id)
		{
			return _cars.FirstOrDefault(c => c.Id == id);
		
		}
	}
}
