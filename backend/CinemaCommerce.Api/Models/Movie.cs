namespace CinemaCommerce.Api.Models;

public class Movie
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal UnitPrice { get; set; }

    public int AvailableTickets { get; set; }
}