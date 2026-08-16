using Microsoft.AspNetCore.Mvc;
using Platform.API.Models;
using Platform.SDK.Services;

namespace AngularBibleReader.Server.Controllers;

[ApiController]
[Route("api/versions/{versionId:int}/books")]
public sealed class BooksController(IBookService bookService) : ControllerBase
{
    /// <summary>The books available in a Bible version, in canonical order.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Book>>> GetBooks(int versionId, CancellationToken cancellationToken)
    {
        var books = await bookService.GetBooksAsync(versionId, cancellationToken);
        return Ok(books);
    }
}
