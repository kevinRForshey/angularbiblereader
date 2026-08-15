using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Platform.API.Exceptions;
using Platform.SDK.Services;

namespace AngularBibleReader.Server.Infrastructure;

/// <summary>
/// Translates the Bible SDK's exception types into ProblemDetails responses instead of letting them
/// surface as opaque 500s.
/// </summary>
public sealed class BibleApiExceptionHandler(ILogger<BibleApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (statusCode, title) = exception switch
        {
            HighlightAccessDeniedException => (StatusCodes.Status403Forbidden, "Highlights access denied"),
            BibleEmptyResponseException => (StatusCodes.Status502BadGateway, "Empty response from Bible API"),
            BibleApiException bibleApiException => ((int)bibleApiException.StatusCode, "Bible API request failed"),
            ArgumentException => (StatusCodes.Status400BadRequest, "Invalid request"),
            _ => (0, string.Empty),
        };

        if (statusCode == 0)
        {
            return false;
        }

        logger.LogWarning(exception, "Bible API request failed with {StatusCode}", statusCode);

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = exception.Message,
        }, cancellationToken);

        return true;
    }
}
