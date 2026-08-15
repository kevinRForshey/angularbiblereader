namespace AngularBibleReader.Server.Models;

/// <summary>Body for requesting additional Data Exchange permissions (e.g. "highlights") for an already signed-in user.</summary>
public sealed record RequestPermissionsRequest(IReadOnlyList<string> Permissions);
