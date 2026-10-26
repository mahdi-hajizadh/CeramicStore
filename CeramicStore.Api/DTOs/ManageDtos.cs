namespace CeramicStore.Api.DTOs;

public record CustomerDto(
    int Id,
    string Username,
    string? FullName,
    string? Phone,
    DateTime CreatedAt,
    int OrderCount,
    decimal TotalSpent);

public record TopProductDto(
    int ProductId,
    string ProductName,
    int Boxes,
    decimal Revenue);

public record DailySalesDto(
    DateOnly Date,
    int Orders,
    decimal Revenue);

public record SalesReportDto(
    int TotalOrders,
    int ActiveOrders,
    decimal Revenue,
    int CustomerCount,
    Dictionary<string, int> OrdersByStatus,
    List<TopProductDto> TopProducts,
    List<DailySalesDto> Last30Days);
