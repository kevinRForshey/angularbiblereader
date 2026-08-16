namespace AngularBibleReader.Server.Models;

/// <summary>Body for creating or updating a highlight. The bible id comes from the route.</summary>
public sealed record HighlightRequest(string Passage, string Color);
