using System.ComponentModel.DataAnnotations;

namespace AngularBibleReader.Server.Models;

/// <summary>Body for registering a new local account.</summary>
public sealed record RegisterRequest(
    [Required, EmailAddress] string Email,
    [Required, MinLength(1)] string DisplayName,
    [Required, MinLength(8)] string Password);
