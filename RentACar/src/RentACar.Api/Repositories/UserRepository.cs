using RentACar.Api.Models;

namespace RentACar.Api.Repositories
{
    // Só leitura e escrita dos utilizadores: as regras estão no AuthServiceUI
    public interface UserRepository
    {
        User? GetByEmail(string email); // Procurar por email
        User? GetById(int id); // Procurar por ID
        void Add(User user); // Guardar um novo user
    }
}