using AngularBibleReader.Server.Data;
using AngularBibleReader.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AngularBibleReader.Server.Controllers;

/// <summary>
/// Local (non-OAuth) account registration and sign-in, added to practice Angular Reactive Forms
/// against a real API. Session-based, separate key namespace from <see cref="AuthController"/>'s
/// OAuth session state so the two auth flows can't collide.
/// </summary>
[ApiController]
[Route("api/account")]
public sealed class AccountController(
    IUserRepository userRepository,
    PasswordHasher<User> passwordHasher) : ControllerBase
{
    private const string UserIdSessionKey = "LocalAuth.UserId";

    /// <summary>The current local sign-in state, if any.</summary>
    [HttpGet("me")]
    public async Task<ActionResult<AccountResponse>> Me(CancellationToken cancellationToken)
    {
        var userId = HttpContext.Session.GetInt32(UserIdSessionKey);
        if (userId is null)
        {
            return NoContent();
        }

        var user = await userRepository.GetByIdAsync(userId.Value, cancellationToken);
        if (user is null)
        {
            HttpContext.Session.Remove(UserIdSessionKey);
            return NoContent();
        }

        return Ok(ToResponse(user));
    }

    [HttpPost("register")]
    public async Task<ActionResult<AccountResponse>> Register(
        [FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        if (await userRepository.EmailExistsAsync(request.Email, cancellationToken))
        {
            return Conflict(new { message = "An account with that email already exists." });
        }

        var user = new User
        {
            Email = request.Email,
            DisplayName = request.DisplayName,
            PasswordHash = string.Empty,
        };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        await userRepository.AddAsync(user, cancellationToken);

        HttpContext.Session.SetInt32(UserIdSessionKey, user.Id);
        return Ok(ToResponse(user));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AccountResponse>> Login(
        [FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (user is null)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        HttpContext.Session.SetInt32(UserIdSessionKey, user.Id);
        return Ok(ToResponse(user));
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        HttpContext.Session.Remove(UserIdSessionKey);
        return NoContent();
    }

    private static AccountResponse ToResponse(User user) => new(user.Id, user.Email, user.DisplayName);
}
