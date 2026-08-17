using Microsoft.AspNetCore.Http;

namespace AngularBibleReader.Server.Tests.TestSupport;

/// <summary>Minimal in-memory <see cref="ISession"/> so controller tests don't need a real request pipeline.</summary>
public sealed class InMemorySession : ISession
{
    private readonly Dictionary<string, byte[]> store = [];

    public bool IsAvailable => true;
    public string Id => "test-session";
    public IEnumerable<string> Keys => store.Keys;

    public void Clear() => store.Clear();
    public Task CommitAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
    public Task LoadAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
    public void Remove(string key) => store.Remove(key);
    public void Set(string key, byte[] value) => store[key] = value;
    public bool TryGetValue(string key, out byte[] value) => store.TryGetValue(key, out value!);
}
