using AngularBibleReader.Server.Models;
using BiblePlatform.UsfmReferences;
using Microsoft.AspNetCore.Mvc;
using Platform.API.Models;
using Platform.SDK.Services;

namespace AngularBibleReader.Server.Controllers;

[ApiController]
[Route("api/bibles/{bibleId:int}/highlights")]
public sealed class HighlightsController(IHighlightService highlightService) : ControllerBase
{
    /// <summary>Highlights within a passage. A whole-chapter reference returns one entry per highlighted verse.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Highlight>>> GetHighlights(
        int bibleId, [FromQuery] string passage, CancellationToken cancellationToken)
    {
        if (!Reference.TryFromString(passage, out var reference))
        {
            return BadRequest($"'{passage}' is not a valid USFM reference.");
        }

        var highlights = await highlightService.GetHighlightsAsync(bibleId, reference, cancellationToken);
        return Ok(highlights);
    }

    /// <summary>Creates a highlight for a passage, or updates its color if one already exists. Requires sign-in.</summary>
    [HttpPut]
    public async Task<ActionResult<Highlight>> CreateOrUpdateHighlight(
        int bibleId, [FromBody] HighlightRequest request, CancellationToken cancellationToken)
    {
        if (!Reference.TryFromString(request.Passage, out var reference))
        {
            return BadRequest($"'{request.Passage}' is not a valid USFM reference.");
        }

        var highlight = await highlightService.CreateOrUpdateHighlightAsync(
            bibleId, reference, request.Color, cancellationToken);
        return Ok(highlight);
    }

    /// <summary>Clears any highlight(s) for a passage. Requires sign-in.</summary>
    [HttpDelete]
    public async Task<IActionResult> ClearHighlights(
        int bibleId, [FromQuery] string passage, CancellationToken cancellationToken)
    {
        if (!Reference.TryFromString(passage, out var reference))
        {
            return BadRequest($"'{passage}' is not a valid USFM reference.");
        }

        await highlightService.ClearHighlightsAsync(bibleId, reference, cancellationToken);
        return NoContent();
    }
}

[ApiController]
[Route("api/highlights/recent-colors")]
public sealed class RecentHighlightColorsController(IHighlightService highlightService) : ControllerBase
{
    /// <summary>The colors the current user has most recently used for highlights.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<string>>> GetRecentColors(CancellationToken cancellationToken)
    {
        var colors = await highlightService.GetRecentColorsAsync(cancellationToken);
        return Ok(colors);
    }
}
