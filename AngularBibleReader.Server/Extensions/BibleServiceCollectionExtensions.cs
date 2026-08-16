using BiblePlatform.UsfmReferences;
using Platform.API.OAuth;
using Platform.SDK.Services;

namespace AngularBibleReader.Server.Extensions;

public static class BibleServiceCollectionExtensions
{
    /// <summary>
    /// Registers the Bible SDK's higher-level services (Platform.SDK.Services) and USFM reference
    /// helpers on top of the low-level clients registered by AddBibleApiClients/AddBibleOAuth.
    /// Must be called after those two.
    /// </summary>
    public static IServiceCollection AddBibleReaderServices(this IServiceCollection services)
    {
        services.AddScoped<IVersionService, VersionService>();
        services.AddScoped<IBookService, BookService>();
        services.AddScoped<IChapterService, ChapterService>();
        services.AddScoped<IPassageService, PassageService>();
        services.AddScoped<IHighlightService, HighlightService>();
        services.AddScoped<IAuthSessionService, AuthSessionService>();
        services.AddSingleton<IUsfmReferenceService, UsfmReferenceService>();

        // Overrides AddBibleOAuth's default InMemoryTokenProvider (single-process, single-user) with
        // a per-session provider suitable for a multi-user web backend.
        services.AddSingleton<ITokenProvider, Auth.SessionTokenProvider>();

        return services;
    }
}
