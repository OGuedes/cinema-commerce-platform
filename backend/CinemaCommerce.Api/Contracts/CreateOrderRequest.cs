using System.ComponentModel.DataAnnotations;

namespace CinemaCommerce.Api.Contracts;

public class CreateOrderRequest
{
    [Range(1, int.MaxValue)]
    public int MovieId { get; set; }
    [Range(1, 10)]
    public int Quantity { get; set; }
}