namespace CeramicStore.Api.Models;

public class Address
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string RecipientName { get; set; } = "";

    public string Phone { get; set; } = "";

    public string Province { get; set; } = "";

    public string City { get; set; } = "";

    public string AddressLine { get; set; } = "";

    public string PostalCode { get; set; } = "";
}
