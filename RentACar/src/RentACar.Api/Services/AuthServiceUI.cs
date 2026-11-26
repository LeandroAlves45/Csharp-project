using Microsoft.AspNetCore.Identity;
using RentACar.Api.DTOs;
using RentACar.Api.Models;
using RentACar.Api.Services;

namespace RentACar.Api.Repositories
{
    public class AuthServiceUI : AuthService
    {
        private readonly UserRepository _userRepository;
        private readonly PasswordHasher<User> _passwordHasher;

        public AuthServiceUI(UserRepository userRepository)
        {
            _userRepository = userRepository;
            _passwordHasher = new PasswordHasher<User>();
        }

        // Implementação do método SignIn
        public UserResponse SignIn(SignIn signIn)
        {
            // Validação dos dados
            if (string.IsNullOrWhiteSpace(signIn.Name) || string.IsNullOrWhiteSpace(signIn.Email) || string.IsNullOrWhiteSpace(signIn.Password))
            {
                throw new ArgumentException("Todos os campos são obrigatórios.");
            }

            if (!System.Net.Mail.MailAddress.TryCreate(signIn.Email.Trim(), out var emailAddress))
            {
                throw new ArgumentException("Email inválido.");
            }

            if (signIn.Password.Length < 6)
            {
                throw new ArgumentException("A password deve ter pelo menos 6 caracteres.");
            }

            // Verifica se o email já está em uso
            if (_userRepository.GetByEmail(signIn.Email.Trim()) != null)
            {
                throw new InvalidOperationException("O email já está em uso.");
            }

            // Criar o user
            User user = new User
            {
                Name = signIn.Name.Trim(),
                Email = signIn.Email.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            // Gerar o hash da senha
            user.PasswordHash = _passwordHasher.HashPassword(user, signIn.Password);

            //Guardar o user no repositório
            _userRepository.Add(user);

            return toResponse(user);

        }

        // Implementação do método Login
        public UserResponse Login(Login login)
        {
            if (string.IsNullOrWhiteSpace(login.Email) || string.IsNullOrWhiteSpace(login.Password))
            {
                throw new ArgumentException("Todos os campos são obrigatórios.");
            }

            User? user = _userRepository.GetByEmail(login.Email.Trim());

            if (user == null)
            {
                throw new UnauthorizedAccessException("Email ou password inválidos.");
            }

            // Verificar a password
            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, login.Password);

            if (result == PasswordVerificationResult.Failed)
            {
                throw new UnauthorizedAccessException("Email ou password inválidos.");
            }

            return toResponse(user);

        }

        //Converter o Model num DTO de resposta
        private UserResponse toResponse(User user)
        {
            return new UserResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
            };
        }
    }
}