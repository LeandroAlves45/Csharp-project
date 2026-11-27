namespace RentACar.Api.Models
{
    // Entidade interna do utilizador. Nunca sai da API: a resposta é o UserResponse (sem a password)
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        // Só o hash da password, nunca a password em texto
        public string PasswordHash { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}