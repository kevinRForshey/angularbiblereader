using AngularBibleReader.Server.Models;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Platform.API.OAuth;
using Platform.SDK.Services;

namespace AngularBibleReader.Server.Controllers;

/// <summary>
/// Drives the Bible Platform's OAuth 2.0 + PKCE sign-in flow and the separate Data Exchange consent
/// flow for resource permissions (e.g. "highlights"). PKCE verifier/state are kept server-side in the
/// session; the browser only ever sees the redirect URLs.
/// </summary>
[ApiController]
[Route("api/auth")]
public sealed class AuthController(IBibleOAuthClient oAuthClient, IAuthSessionService authSessionService) : ControllerBase
{
    private const string StateSessionKey = "BibleApi.OAuthState";
    private const string PkceVerifierSessionKey = "BibleApi.PkceVerifier";
    private const string ReturnUrlSessionKey = "BibleApi.ReturnUrl";

    /// <summary>The current user's sign-in state.</summary>
    [HttpGet("session")]
    public async Task<ActionResult<AuthSession>> GetSession(CancellationToken cancellationToken)
    {
        var session = await authSessionService.GetCurrentSessionAsync(cancellationToken);
        return Ok(session);
    }

    /// <summary>
    /// Builds the URL to redirect the browser to for sign-in, optionally requesting resource
    /// permissions (e.g. "highlights") as part of the same consent screen.
    /// </summary>
    [HttpGet("sign-in-url")]
    public ActionResult<object> GetSignInUrl(
        [FromQuery] string[]? permissions = null, [FromQuery] string returnUrl = "/")
    {
        var state = Guid.NewGuid().ToString("N");
        var authorizationRequest = oAuthClient.BuildAuthorizationUrl(state, permissions);

        HttpContext.Session.SetString(StateSessionKey, state);
        HttpContext.Session.SetString(PkceVerifierSessionKey, authorizationRequest.Pkce.CodeVerifier);
        HttpContext.Session.SetString(ReturnUrlSessionKey, returnUrl);

        return Ok(new { url = authorizationRequest.AuthorizationUrl });
    }

    /// <summary>
    /// Handles the redirect back from the platform after sign-in (confidential-client "code" flow or
    /// browser-client identity flow) or after a Data Exchange permission approval, then redirects the
    /// browser back into the Angular app.
    /// </summary>
    [HttpGet("callback")]
    public async Task<IActionResult> Callback(CancellationToken cancellationToken)
    {
        var query = Request.Query;
        var returnUrl = HttpContext.Session.GetString(ReturnUrlSessionKey) ?? "/";
        var codeVerifier = HttpContext.Session.GetString(PkceVerifierSessionKey);

        if (query.ContainsKey("data_exchange_status"))
        {
            var result = oAuthClient.ParseDataExchangeCallback(new Uri(Request.GetEncodedUrl()));
            HttpContext.Session.Remove(PkceVerifierSessionKey);
            return Redirect($"{returnUrl}?dataExchangeStatus={result.Status}");
        }

        var expectedState = HttpContext.Session.GetString(StateSessionKey);
        if (query.TryGetValue("state", out var actualState) &&
            !oAuthClient.ValidateState(expectedState ?? string.Empty, actualState.ToString()))
        {
            return BadRequest("State mismatch — possible CSRF attempt.");
        }

        if (query.TryGetValue("code", out var code))
        {
            await oAuthClient.ExchangeCodeAsync(code.ToString(), codeVerifier ?? string.Empty, cancellationToken);
        }
        else if (query.TryGetValue("yvp_id", out var yvpId))
        {
            await oAuthClient.CompleteIdentityCallbackAsync(
                state: query["state"].ToString(),
                yvpId: yvpId.ToString(),
                userName: query["user_name"].ToString(),
                userEmail: query["user_email"].ToString(),
                profilePicture: query["profile_picture"].ToString(),
                codeVerifier: codeVerifier ?? string.Empty,
                cancellationToken);
        }
        else
        {
            return BadRequest("Callback did not contain a recognized authorization result.");
        }

        HttpContext.Session.Remove(PkceVerifierSessionKey);
        HttpContext.Session.Remove(StateSessionKey);
        return Redirect(returnUrl);
    }

    /// <summary>Refreshes the current user's access token using their stored refresh token.</summary>
    [HttpPost("refresh")]
    public async Task<ActionResult<OAuthTokenResponse>> Refresh(CancellationToken cancellationToken)
    {
        var token = await oAuthClient.RefreshTokenAsync(cancellationToken);
        return Ok(token);
    }

    /// <summary>Signs the current user out, clearing their stored token.</summary>
    [HttpPost("sign-out")]
    public async Task<IActionResult> SignOut(CancellationToken cancellationToken)
    {
        await oAuthClient.SignOutAsync(cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Requests additional resource permissions (e.g. "highlights") for an already signed-in user and
    /// returns the URL to redirect the browser to for consent.
    /// </summary>
    [HttpPost("permissions/request")]
    public async Task<ActionResult<object>> RequestPermissions(
        [FromBody] RequestPermissionsRequest request, CancellationToken cancellationToken)
    {
        var dataExchangeToken = await oAuthClient.RequestPermissionsAsync(request.Permissions, cancellationToken);
        var approvalUrl = oAuthClient.BuildDataExchangeApprovalUrl(dataExchangeToken.Token);
        return Ok(new { approvalUrl, expiresIn = dataExchangeToken.ExpiresIn });
    }

    /// <summary>Completes a Data Exchange approval directly (no browser redirect), for confidential/server clients.</summary>
    [HttpPost("permissions/approve")]
    public async Task<ActionResult<DataExchangeCallbackResult>> ApprovePermissions(
        [FromBody] DataExchangeApprovalRequest request, CancellationToken cancellationToken)
    {
        var result = await oAuthClient.CompleteDataExchangeApprovalAsync(request.Token, cancellationToken);
        return Ok(result);
    }
}
