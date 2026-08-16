using Microsoft.AspNetCore.Mvc;
using Platform.API.Clients;
using Platform.API.Models;

namespace AngularBibleReader.Server.Controllers;

[ApiController]
[Route("api/versions/{versionId:int}/books/{bookUsfm}/chapters/{chapterNumber:int}/verses")]
public sealed class VersesController(IBibleClient bibleClient) : ControllerBase
{
    /// <summary>
    /// The verses of a chapter. These carry verse numbers and USFM references only — use
    /// the passage endpoints to fetch actual scripture text.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Verse>>> GetVerses(
        int versionId, string bookUsfm, int chapterNumber, CancellationToken cancellationToken)
    {
        var verses = await bibleClient.GetVersesAsync(versionId, bookUsfm, chapterNumber, cancellationToken);
        return Ok(verses);
    }
}
