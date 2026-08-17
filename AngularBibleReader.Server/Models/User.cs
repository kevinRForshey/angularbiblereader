namespace AngularBibleReader.Server.Models;

/// <summary>A locally registered account (separate from Bible Platform OAuth sign-in).</summary>
public sealed class User
{
    public int Id { get; set; }

    public required string Email { get; set; }

    public required string DisplayName { get; set; }

    public required string PasswordHash { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
