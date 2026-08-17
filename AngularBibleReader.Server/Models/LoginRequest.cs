using System.ComponentModel.DataAnnotations;

namespace AngularBibleReader.Server.Models;

/// <summary>Body for signing in to a local account.</summary>
public sealed record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password);
