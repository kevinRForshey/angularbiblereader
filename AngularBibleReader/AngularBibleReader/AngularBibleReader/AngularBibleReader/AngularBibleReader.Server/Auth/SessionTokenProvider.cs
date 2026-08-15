using System.Text.Json;
using Platform.API.OAuth;

namespace AngularBibleReader.Server.Auth;

/// <summary>
/// Stores the signed-in user's OAuth token in their ASP.NET Core session instead of a single
/// process-wide field, so each browser session gets its own token. Reads the current
/// <see cref="HttpContext"/> through <see cref="IHttpContextAccessor"/> on every call rather than
/// capturing it at construction, since instances of this class are held onto (and reused across
/// requests) by IHttpClientFactory's pooled message handlers.
/// </summary>
public sealed class SessionTokenProvider(IHttpContextAccessor httpContextAccessor) : ITokenProvider
{
    private const string SessionKey = "BibleApi.OAuthToken";

    public Task<OAuthTokenResponse?> GetTokenAsync(CancellationToken cancellationToken)
    {
        var json = Session.GetString(SessionKey);
        var token = json is null ? null : JsonSerializer.Deserialize<OAuthTokenResponse>(json);
        return Task.FromResult(token);
    }

    public Task StoreTokenAsync(OAuthTokenResponse token, CancellationToken cancellationToken)
    {
        Session.SetString(SessionKey, JsonSerializer.Serialize(token));
        return Task.CompletedTask;
    }

    public Task ClearTokenAsync(CancellationToken cancellationToken)
    {
        Session.Remove(SessionKey);
        return Task.CompletedTask;
    }

    private ISession Session =>
        httpContextAccessor.HttpContext?.Session
        ?? throw new InvalidOperationException("No active HTTP context with session support is available.");
}
