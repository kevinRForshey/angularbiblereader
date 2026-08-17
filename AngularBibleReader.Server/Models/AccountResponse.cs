namespace AngularBibleReader.Server.Models;

/// <summary>Public-facing shape of a signed-in local account (never includes the password hash).</summary>
public sealed record AccountResponse(int Id, string Email, string DisplayName);
