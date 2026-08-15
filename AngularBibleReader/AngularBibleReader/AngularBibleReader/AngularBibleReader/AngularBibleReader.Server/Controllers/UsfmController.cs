using BiblePlatform.UsfmReferences;
using Microsoft.AspNetCore.Mvc;

namespace AngularBibleReader.Server.Controllers;

/// <summary>USFM reference validation and lookup helpers, so the client doesn't need its own copy of the book catalog.</summary>
[ApiController]
[Route("api/usfm")]
public sealed class UsfmController(IUsfmReferenceService usfmReferenceService) : ControllerBase
{
    /// <summary>The full USFM book catalog, split into old/new testament.</summary>
    [HttpGet("books")]
    public ActionResult<object> GetBooks()
    {
        return Ok(new
        {
            all = BookCatalog.Books,
            oldTestament = BookCatalog.OldTestamentBooks,
            newTestament = BookCatalog.NewTestamentBooks,
        });
    }

    /// <summary>Whether a USFM book code is recognized.</summary>
    [HttpGet("books/{book}/is-known")]
    public ActionResult<bool> IsKnownBook(string book) => Ok(BookCatalog.IsKnownBook(book));

    /// <summary>The canon (Old/New Testament/Apocrypha) a book belongs to.</summary>
    [HttpGet("books/{book}/canon")]
    public ActionResult<Canon> GetCanon(string book) => Ok(BookCatalog.GetCanon(book));

    /// <summary>Converts a free-form book name (e.g. "John") to its USFM code (e.g. "JHN").</summary>
    [HttpGet("books/from-name")]
    public ActionResult<string> ConvertBookNameToUsfm([FromQuery] string name) =>
        Ok(usfmReferenceService.ConvertBookNameToUsfm(name));

    /// <summary>Validates a USFM reference string against a specific reference shape.</summary>
    [HttpGet("validate")]
    public ActionResult<object> Validate([FromQuery] string reference, [FromQuery] char? multiDelimiter = null)
    {
        return Ok(new
        {
            isValidUsfm = usfmReferenceService.IsValidUsfm(reference),
            isValidVerse = usfmReferenceService.IsValidVerse(reference),
            isValidChapter = usfmReferenceService.IsValidChapter(reference),
            isValidChapterOrIntro = usfmReferenceService.IsValidChapterOrIntro(reference),
            isValidPassage = usfmReferenceService.IsValidPassage(reference),
            isValidMultiUsfm = multiDelimiter is not null && usfmReferenceService.IsValidMultiUsfm(reference, multiDelimiter.Value),
        });
    }

    /// <summary>Parses a USFM reference string into its structured parts (book, chapter, verses).</summary>
    [HttpGet("parse")]
    public ActionResult<Reference> Parse([FromQuery] string reference)
    {
        return Reference.TryFromString(reference, out var parsed)
            ? Ok(parsed)
            : BadRequest($"'{reference}' is not a valid USFM reference.");
    }
}
