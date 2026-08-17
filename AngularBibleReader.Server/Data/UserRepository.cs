using AngularBibleReader.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace AngularBibleReader.Server.Data;

/// <summary>
/// EF Core-backed user store. Emails are normalized to lowercase before storage/lookup so
/// comparisons are consistent regardless of SQLite's default case-sensitive text collation.
/// </summary>
public sealed class UserRepository(AppDbContext dbContext) : IUserRepository
{
    public Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
        dbContext.Users.SingleOrDefaultAsync(u => u.Id == id, cancellationToken);

    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken) =>
        dbContext.Users.SingleOrDefaultAsync(u => u.Email == Normalize(email), cancellationToken);

    public Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken) =>
        dbContext.Users.AnyAsync(u => u.Email == Normalize(email), cancellationToken);

    public async Task AddAsync(User user, CancellationToken cancellationToken)
    {
        user.Email = Normalize(user.Email);
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static string Normalize(string email) => email.Trim().ToLowerInvariant();
}
