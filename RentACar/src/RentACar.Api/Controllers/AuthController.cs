
using Microsoft.AspNetCore.Mvc;
using RentACar.Api.DTOs;
using RentACar.Api.Services;

namespace RentACar.Api.Controllers
{
    // Controller fino: recebe o DTO, chama o AuthService e escolhe o código HTTP.
    // As regras (campos obrigatórios, email único, password) estão no service.
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        // Depende da interface (AuthService), não da classe: o Program.cs escolhe a implementação
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        // POST /api/auth/register: 201 com o utilizador criado (sem a password)

        [HttpPost("register")]
        public IActionResult SignIn(SignIn signIn)
        {
            try
            {
                UserResponse user = _authService.SignIn(signIn);

                return StatusCode(201, user);
            }
            // Cada tipo de exceção do service corresponde a um código HTTP: 400 dados inválidos, 409 email repetido
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        // POST /api/auth/login: 200 com id, nome e email. O frontend guarda isto como sessão

        [HttpPost("login")]
        public IActionResult Login(Login login)
        {
            try
            {
                UserResponse user = _authService.Login(login);

                return Ok(user);
            }
            // 400 campos vazios; 401 credenciais erradas (a mesma mensagem para email e password,
            // para não revelar que emails existem)
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }
    }
}
