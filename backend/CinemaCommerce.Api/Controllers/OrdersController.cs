using CinemaCommerce.Api.Contracts;
using CinemaCommerce.Api.Data;
using CinemaCommerce.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CinemaCommerce.Api.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly CinemaDbContext _database;

    public OrdersController(CinemaDbContext database)
    {
        _database = database;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Order>>> GetAll()
    {
        List<Order> orders = await _database.Orders
            .OrderByDescending(order => order.CreatedAtUtc)
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Order>> GetById(Guid id)
    {
        Order? order = await _database.Orders.FindAsync(id);

        if (order is null)
        {
            return NotFound(new
            {
                message = "Pedido não encontrado."
            });
        }

        return Ok(order);
    }

    [HttpPost]
    public async Task<ActionResult<Order>> Create(
        CreateOrderRequest request
    )
    {
        Movie? movie = await _database.Movies.FindAsync(
            request.MovieId
        );

        if (movie is null)
        {
            return BadRequest(new
            {
                message = "O filme informado não existe."
            });
        }

        if (movie.AvailableTickets < request.Quantity)
        {
            return Conflict(new
            {
                message = "Não há ingressos suficientes.",
                availableTickets = movie.AvailableTickets
            });
        }

        var order = new Order
        {
            Id = Guid.NewGuid(),
            MovieId = movie.Id,
            MovieName = movie.Name,
            Quantity = request.Quantity,
            UnitPrice = movie.UnitPrice,
            Status = "Pending",
            CreatedAtUtc = DateTime.UtcNow
        };

        movie.AvailableTickets -= request.Quantity;

        await _database.Orders.AddAsync(order);

        await _database.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = order.Id },
            order
        );
    }
}