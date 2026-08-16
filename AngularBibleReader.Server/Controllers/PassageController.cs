using BiblePlatform.UsfmReferences;
using Microsoft.AspNetCore.Mvc;
using Platform.API.Models;
using Platform.SDK.Services;

namespace AngularBibleReader.Server.Controllers;

[ApiController]
[Route("api/versions/{versionId:int}")]
public sealed class PassageController(IPassageService passageService) : ControllerBase
{
    /// <summary>Retrieves a passage from a raw USFM reference (e.g. "JHN.3.16", "GEN.1", "MAT.1.1-5").</summary>
    [HttpGet("passage")]
    public async Task<ActionResult<Passage>> GetPassageByUsfm(
        int versionId,
        [FromQuery] string usfm,
        [FromQuery] PassageFormat format = PassageFormat.Text,
        [FromQuery] bool includeHeadings = false,
        [FromQuery] bool includeNotes = false,
        CancellationToken cancellationToken = default)
    {
        if (!Reference.TryFromString(usfm, out var reference))
        {
            return BadRequest($"'{usfm}' is not a valid USFM reference.");
        }

        var options = new PassageRequestOptions
        {
            Format = format,
            IncludeHeadings = includeHeadings,
            IncludeNotes = includeNotes,
        };

        var passage = await passageService.GetPassageAsync(versionId, reference, options, cancellationToken);
        return Ok(passage);
    }

    /// <summary>Retrieves a passage from book/chapter/verse primitives, without building a USFM string.</summary>
    [HttpGet("books/{bookUsfm}/chapters/{chapter:int}/verses/{verseStart:int}/passage")]
    public async Task<ActionResult<Passage>> GetPassageByReference(
        int versionId,
        string bookUsfm,
        int chapter,
        int verseStart,
        [FromQuery] int? verseEnd = null,
        [FromQuery] PassageFormat format = PassageFormat.Text,
        [FromQuery] bool includeHeadings = false,
        [FromQuery] bool includeNotes = false,
        CancellationToken cancellationToken = default)
    {
        var options = new PassageRequestOptions
        {
            Format = format,
            IncludeHeadings = includeHeadings,
            IncludeNotes = includeNotes,
        };

        var passage = await passageService.GetPassageAsync(
            versionId, bookUsfm, chapter, verseStart, verseEnd, options, cancellationToken);
        return Ok(passage);
    }
}
