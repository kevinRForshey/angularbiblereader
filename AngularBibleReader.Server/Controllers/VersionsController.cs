using Microsoft.AspNetCore.Mvc;
using Platform.API.Clients;
using Platform.API.Models;
using Platform.SDK.Services;

namespace AngularBibleReader.Server.Controllers;

[ApiController]
[Route("api/versions")]
public sealed class VersionsController(IVersionService versionService, IBibleClient bibleClient) : ControllerBase
{
    /// <summary>All Bible versions available for a language, transparently paged through in full.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BibleVersionSummary>>> GetVersions(
        [FromQuery] string languageRange = "en", CancellationToken cancellationToken = default)
    {
        var versions = await versionService.GetVersionsAsync(languageRange, cancellationToken);
        return Ok(versions);
    }

    /// <summary>A single page of Bible versions, for callers that want to manage paging themselves.</summary>
    [HttpGet("paged")]
    public async Task<ActionResult<PagedResult<BibleVersionSummary>>> GetVersionsPaged(
        [FromQuery] string languageRange = "en",
        [FromQuery] string? pageToken = null,
        [FromQuery] int? pageSize = null,
        CancellationToken cancellationToken = default)
    {
        var page = await bibleClient.GetVersionsAsync(languageRange, pageToken, pageSize, cancellationToken);
        return Ok(page);
    }

    /// <summary>Full metadata for a single Bible version, including its list of available books.</summary>
    [HttpGet("{versionId:int}")]
    public async Task<ActionResult<BibleVersion>> GetVersion(int versionId, CancellationToken cancellationToken)
    {
        var version = await bibleClient.GetVersionAsync(versionId, cancellationToken);
        return Ok(version);
    }

    /// <summary>The full book/chapter/verse structure for a version, as reported by the API's /index endpoint.</summary>
    [HttpGet("{versionId:int}/index")]
    public async Task<ActionResult<BibleIndex>> GetIndex(int versionId, CancellationToken cancellationToken)
    {
        var index = await bibleClient.GetIndexAsync(versionId, cancellationToken);
        return Ok(index);
    }
}
