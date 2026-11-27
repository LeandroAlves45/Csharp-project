namespace RentACar.Api.DTOs
{
	// Corpo do POST /api/auth/register
	public class SignIn
	{
		public string Name { get; set; } = string.Empty;
		public string Email { get; set; } = string.Empty;
		public string Password { get; set; } = string.Empty;
	}
}