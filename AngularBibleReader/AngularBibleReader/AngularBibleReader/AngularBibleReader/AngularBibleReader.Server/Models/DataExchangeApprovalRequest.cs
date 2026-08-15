namespace AngularBibleReader.Server.Models;

/// <summary>Body for completing a Data Exchange approval without a browser redirect.</summary>
public sealed record DataExchangeApprovalRequest(string Token);
