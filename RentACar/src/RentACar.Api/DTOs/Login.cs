namespace RentACar.Api.DTOs
{
    // Corpo do POST /api/auth/login
    public class Login
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}