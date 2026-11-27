using RentACar.Api.Models;

namespace RentACar.Api.Repositories
{
    // Utilizadores numa List em memória (Singleton no Program.cs)
    public class MemoryUserRepository : UserRepository
    {
        private readonly List<User> _users = new List<User>(); // Lista de utilizadores em memória, sem ser preciso uma BD
        
        private int _nextId = 1; // atribuir um ID única a cada user

        public User? GetById(int id)
        {
            return _users.FirstOrDefault(u => u.Id == id); // Procurar por ID que corresponde à condição ou devolve null se não encontrar
        }

        public User? GetByEmail(string email)
        {
            return _users.FirstOrDefault(u => string.Equals(u.Email, email, StringComparison.OrdinalIgnoreCase)); // Procurar por email, ignorando maiúsculas e minúsculas
        }

        public void Add(User user)
        {
            user.Id = _nextId;
            _nextId++;

            _users.Add(user);
        }
    }
}