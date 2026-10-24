namespace CinemaCommerce.Api.Models;

public class Order
{
    public Guid Id { get; set; }

    public int MovieId { get; set; }

    public string MovieName { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal TotalValue => UnitPrice * Quantity;

    public string Status { get; set; } = "Pending";

    public DateTime CreatedAtUtc { get; set; }
}