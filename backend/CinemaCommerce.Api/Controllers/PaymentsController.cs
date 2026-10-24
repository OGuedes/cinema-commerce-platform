using CinemaCommerce.Api.Data;
using CinemaCommerce.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CinemaCommerce.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly CinemaDbContext _database;

    public PaymentsController(CinemaDbContext database)
    {
        _database = database;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Payment>>> GetAll()
    {
        List<Payment> payments = await _database.Payments
            .OrderByDescending(payment => payment.ProcessedAtUtc)
            .ToListAsync();

        return Ok(payments);
    }

    [HttpPost("{orderId:guid}")]
    public async Task<ActionResult<Payment>> Process(Guid orderId)
    {
        Order? order = await _database.Orders.FindAsync(orderId);

        if (order is null)
        {
            return NotFound(new
            {
                message = "Pedido não encontrado."
            });
        }

        if (order.Status == "Paid")
        {
            return Conflict(new
            {
                message = "Este pedido já foi pago."
            });
        }

        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            Amount = order.TotalValue,
            Status = "Approved",
            ProcessedAtUtc = DateTime.UtcNow
        };

        order.Status = "Paid";
        await _database.Payments.AddAsync(payment);
        await _database.SaveChangesAsync();

        return Ok(payment);
    }
}
