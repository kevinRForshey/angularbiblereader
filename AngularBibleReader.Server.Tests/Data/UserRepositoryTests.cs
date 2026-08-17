using AngularBibleReader.Server.Data;
using AngularBibleReader.Server.Models;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace AngularBibleReader.Server.Tests.Data;

public sealed class UserRepositoryTests
{
    private SqliteConnection connection = null!;
    private AppDbContext dbContext = null!;
    private UserRepository repository = null!;

    [SetUp]
    public void SetUp()
    {
        connection = new SqliteConnection("Filename=:memory:");
        connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

        dbContext = new AppDbContext(options);
        dbContext.Database.EnsureCreated();
        repository = new UserRepository(dbContext);
    }

    [TearDown]
    public void TearDown()
    {
        dbContext.Dispose();
        connection.Dispose();
    }

    [Test]
    public async Task AddAsync_NormalizesEmailToLowercase()
    {
        var user = new User { Email = "Person@Example.com", DisplayName = "Person", PasswordHash = "hash" };

        await repository.AddAsync(user, CancellationToken.None);

        Assert.That(user.Email, Is.EqualTo("person@example.com"));
    }

    [Test]
    public async Task GetByEmailAsync_IsCaseInsensitive()
    {
        await repository.AddAsync(
            new User { Email = "Person@Example.com", DisplayName = "Person", PasswordHash = "hash" },
            CancellationToken.None);

        var found = await repository.GetByEmailAsync("PERSON@EXAMPLE.COM", CancellationToken.None);

        Assert.That(found, Is.Not.Null);
        Assert.That(found!.DisplayName, Is.EqualTo("Person"));
    }

    [Test]
    public async Task GetByEmailAsync_ReturnsNull_WhenNoMatch()
    {
        var found = await repository.GetByEmailAsync("nobody@example.com", CancellationToken.None);

        Assert.That(found, Is.Null);
    }

    [Test]
    public async Task EmailExistsAsync_ReflectsWhetherUserWasAdded()
    {
        Assert.That(await repository.EmailExistsAsync("person@example.com", CancellationToken.None), Is.False);

        await repository.AddAsync(
            new User { Email = "person@example.com", DisplayName = "Person", PasswordHash = "hash" },
            CancellationToken.None);

        Assert.That(await repository.EmailExistsAsync("person@example.com", CancellationToken.None), Is.True);
    }

    [Test]
    public async Task GetByIdAsync_ReturnsNull_WhenNoMatch()
    {
        var found = await repository.GetByIdAsync(999, CancellationToken.None);

        Assert.That(found, Is.Null);
    }
}
