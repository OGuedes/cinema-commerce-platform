namespace CinemaCommerce.Api.Models;

public class Payment
{
    public Guid Id { get; set; }

    public Guid OrderId { get; set; }

    public decimal Amount { get; set; }

    public string Status { get; set; } = "Approved";

    public DateTime ProcessedAtUtc { get; set; }
}
