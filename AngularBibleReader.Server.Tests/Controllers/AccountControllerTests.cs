using AngularBibleReader.Server.Controllers;
using AngularBibleReader.Server.Data;
using AngularBibleReader.Server.Models;
using AngularBibleReader.Server.Tests.TestSupport;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace AngularBibleReader.Server.Tests.Controllers;

public sealed class AccountControllerTests
{
    private SqliteConnection connection = null!;
    private AppDbContext dbContext = null!;
    private AccountController controller = null!;

    [SetUp]
    public void SetUp()
    {
        connection = new SqliteConnection("Filename=:memory:");
        connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options;
        dbContext = new AppDbContext(options);
        dbContext.Database.EnsureCreated();

        var repository = new UserRepository(dbContext);
        controller = new AccountController(repository, new PasswordHasher<User>())
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { Session = new InMemorySession() },
            },
        };
    }

    [TearDown]
    public void TearDown()
    {
        dbContext.Dispose();
        connection.Dispose();
    }

    [Test]
    public async Task Register_HappyPath_ReturnsAccountAndStartsSession()
    {
        var request = new RegisterRequest("person@example.com", "Person", "password123");

        var result = await controller.Register(request, CancellationToken.None);

        var ok = result.Result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var account = ok!.Value as AccountResponse;
        Assert.That(account!.Email, Is.EqualTo("person@example.com"));
        Assert.That(controller.HttpContext.Session.GetInt32("LocalAuth.UserId"), Is.EqualTo(account.Id));
    }

    [Test]
    public async Task Register_DuplicateEmail_ReturnsConflict()
    {
        var request = new RegisterRequest("person@example.com", "Person", "password123");
        await controller.Register(request, CancellationToken.None);

        var result = await controller.Register(request, CancellationToken.None);

        Assert.That(result.Result, Is.InstanceOf<ConflictObjectResult>());
    }

    [Test]
    public async Task Login_CorrectCredentials_ReturnsAccountAndStartsSession()
    {
        await controller.Register(new RegisterRequest("person@example.com", "Person", "password123"), CancellationToken.None);
        controller.HttpContext.Session.Clear();

        var result = await controller.Login(new LoginRequest("person@example.com", "password123"), CancellationToken.None);

        var ok = result.Result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        Assert.That(controller.HttpContext.Session.GetInt32("LocalAuth.UserId"), Is.Not.Null);
    }

    [Test]
    public async Task Login_WrongPassword_ReturnsUnauthorized()
    {
        await controller.Register(new RegisterRequest("person@example.com", "Person", "password123"), CancellationToken.None);
        controller.HttpContext.Session.Clear();

        var result = await controller.Login(new LoginRequest("person@example.com", "wrong-password"), CancellationToken.None);

        Assert.That(result.Result, Is.InstanceOf<UnauthorizedObjectResult>());
    }

    [Test]
    public async Task Login_UnknownEmail_ReturnsUnauthorized()
    {
        var result = await controller.Login(new LoginRequest("nobody@example.com", "password123"), CancellationToken.None);

        Assert.That(result.Result, Is.InstanceOf<UnauthorizedObjectResult>());
    }

    [Test]
    public async Task Me_WithoutSession_ReturnsNoContent()
    {
        var result = await controller.Me(CancellationToken.None);

        Assert.That(result.Result, Is.InstanceOf<NoContentResult>());
    }

    [Test]
    public async Task Me_WithSession_ReturnsAccount()
    {
        await controller.Register(new RegisterRequest("person@example.com", "Person", "password123"), CancellationToken.None);

        var result = await controller.Me(CancellationToken.None);

        var ok = result.Result as OkObjectResult;
        Assert.That((ok!.Value as AccountResponse)!.Email, Is.EqualTo("person@example.com"));
    }

    [Test]
    public async Task Logout_ClearsSession()
    {
        await controller.Register(new RegisterRequest("person@example.com", "Person", "password123"), CancellationToken.None);

        controller.Logout();

        Assert.That(controller.HttpContext.Session.GetInt32("LocalAuth.UserId"), Is.Null);
    }
}
