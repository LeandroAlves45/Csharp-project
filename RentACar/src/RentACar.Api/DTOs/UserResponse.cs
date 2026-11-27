namespace RentACar.Api.DTOs
{
    // O que a API devolve de um utilizador: sem a password nem o hash
    public class UserResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}