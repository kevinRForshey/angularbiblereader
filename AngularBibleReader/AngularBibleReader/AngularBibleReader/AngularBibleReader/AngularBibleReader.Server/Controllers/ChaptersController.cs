using Microsoft.AspNetCore.Mvc;
using Platform.API.Models;
using Platform.SDK.Services;

namespace AngularBibleReader.Server.Controllers;

[ApiController]
[Route("api/versions/{versionId:int}/books/{bookUsfm}/chapters")]
public sealed class ChaptersController(IChapterService chapterService) : ControllerBase
{
    /// <summary>The chapters of a book, with real per-chapter verse counts.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Chapter>>> GetChapters(
        int versionId, string bookUsfm, CancellationToken cancellationToken)
    {
        var chapters = await chapterService.GetChaptersAsync(versionId, bookUsfm, cancellationToken);
        return Ok(chapters);
    }
}
