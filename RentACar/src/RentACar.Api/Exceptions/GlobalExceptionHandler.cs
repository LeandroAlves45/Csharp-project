using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace RentACar.Api.Exceptions;

// Único sítio que traduz exceções de negócio em respostas HTTP.
// Assim os Services não sabem nada de HTTP e os Controllers não precisam de try/catch.
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly IProblemDetailsService _problemDetailsService;

    public GlobalExceptionHandler(IProblemDetailsService problemDetailsService) =>
        _problemDetailsService = problemDetailsService;

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        // A tabela da secção 8 do ARCHITECTURE.md, escrita em código
        int? statusCode = exception switch
        {
            BadRequestException => StatusCodes.Status400BadRequest,
            UnauthorizedException => StatusCodes.Status401Unauthorized,
            ForbiddenException => StatusCodes.Status403Forbidden,
            NotFoundException => StatusCodes.Status404NotFound,
            ConflictException => StatusCodes.Status409Conflict,
            _ => null,
        };

        // Exceção que não é nossa (um bug): devolvemos false para o ASP.NET Core
        // responder 500 sem mostrar detalhes internos ao cliente
        if (statusCode is null) return false;

        httpContext.Response.StatusCode = statusCode.Value;

        // ProblemDetails é o formato padrão de erro (RFC 9457): o frontend lê sempre o campo "detail"
        return await _problemDetailsService.TryWriteAsync(
            new ProblemDetailsContext
            {
                HttpContext = httpContext,
                Exception = exception,
                ProblemDetails = new ProblemDetails
                {
                    Status = statusCode,
                    Detail = exception.Message,
                },
            });
    }
}
