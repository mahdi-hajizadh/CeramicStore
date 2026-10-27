namespace CeramicStore.Api.Services;

public interface ISmsSender
{
    Task SendAsync(string phone, string message, CancellationToken cancellationToken = default);
}
