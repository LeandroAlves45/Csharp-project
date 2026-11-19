using RentACar.Api.Models;

namespace RentACar.Api.Repositories
{
    public interface UserRepository
    {
        User? GetByEmail(string email); // Procurar por email
        User? GetById(int id); // Procurar por ID
        void Add(User user); // Guardar um novo user
    }
}