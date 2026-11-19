
using Microsoft.AspNetCore.Mvc;
using RentACar.Api.DTOs;
using RentACar.Api.Services;

namespace RentACar.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        // Registar um novo utilizador

        [HttpPost("register")]
        public IActionResult SignIn(SignIn signIn)
        {
            try
            {
                UserResponse user = _authService.SignIn(signIn);

                return StatusCode(201, user);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        // Login de um utilizador

        [HttpPost("login")]
        public IActionResult Login(Login login)
        {
            try
            {
                UserResponse user = _authService.Login(login);

                return Ok(user);
            }
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
