namespace CeramicStore.Api.Services;

public static class SearchHelpers
{
    // کاراکترهای خاص LIKE را بی‌اثر می‌کند تا ورودی کاربر الگو نشود.
    public static string EscapeLike(string value) =>
        value
            .Replace("\\", "\\\\")
            .Replace("%", "\\%")
            .Replace("_", "\\_");
}
