namespace CeramicStore.Api.Services;

public static class SearchHelpers
{
    // Escape LIKE metacharacters so user input is treated as literal text.
    public static string EscapeLike(string value) =>
        value
            .Replace("\\", "\\\\")
            .Replace("%", "\\%")
            .Replace("_", "\\_");
}
