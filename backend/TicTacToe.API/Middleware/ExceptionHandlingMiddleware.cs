using System.Net;
using System.Text.Json;
using TicTacToe.API.DTOs;
using TicTacToe.API.Exceptions;

namespace TicTacToe.API.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, error) = exception switch
        {
            GameNotFoundException e      => (HttpStatusCode.NotFound, new ErrorResponse(e.Message)),
            InvalidMoveException e       => (HttpStatusCode.BadRequest, new ErrorResponse(e.Message)),
            GameAlreadyCompletedException e => (HttpStatusCode.BadRequest, new ErrorResponse(e.Message)),
            ArgumentException e          => (HttpStatusCode.BadRequest, new ErrorResponse(e.Message)),
            _                            => (HttpStatusCode.InternalServerError, new ErrorResponse("An unexpected error occurred.")),
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var json = JsonSerializer.Serialize(error, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        return context.Response.WriteAsync(json);
    }
}
