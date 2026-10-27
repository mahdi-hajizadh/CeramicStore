using System.Text;

namespace CeramicStore.Api.Services;

public static class PhoneNormalizer
{
    // موبایل ایران را به شکل استاندارد 09xxxxxxxxx برمی‌گرداند؛ در غیر این صورت null.
    public static string? NormalizeMobile(string? input)
    {
        if (string.IsNullOrWhiteSpace(input)) return null;

        var builder = new StringBuilder(input.Length);

        foreach (var ch in input.Trim())
        {
            if (ch is >= '0' and <= '9')
            {
                builder.Append(ch);
            }
            else if (ch is >= '۰' and <= '۹')
            {
                builder.Append((char)('0' + (ch - '۰')));
            }
            else if (ch is >= '٠' and <= '٩')
            {
                builder.Append((char)('0' + (ch - '٠')));
            }
        }

        var digits = builder.ToString();

        if (digits.StartsWith("0098", StringComparison.Ordinal))
            digits = "0" + digits[4..];
        else if (digits.StartsWith("98", StringComparison.Ordinal) && digits.Length == 12)
            digits = "0" + digits[2..];
        else if (digits.StartsWith("+98", StringComparison.Ordinal))
            digits = "0" + digits[3..];
        else if (digits.Length == 10 && digits.StartsWith('9'))
            digits = "0" + digits;

        if (digits.Length == 11 && digits.StartsWith("09", StringComparison.Ordinal))
            return digits;

        return null;
    }

    public static bool IsValidMobile(string? input) => NormalizeMobile(input) is not null;
}
