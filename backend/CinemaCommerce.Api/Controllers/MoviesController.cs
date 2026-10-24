using CinemaCommerce.Api.Data;
using CinemaCommerce.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CinemaCommerce.Api.Controllers;

[ApiController]
[Route("api/movies")]
public class MoviesController : ControllerBase
{
    private readonly CinemaDbContext _database;

    public MoviesController(CinemaDbContext database)
    {
        _database = database;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Movie>>> GetAll()
    {
        List<Movie> movies = await _database.Movies
            .OrderBy(movie => movie.Id)
            .ToListAsync();

        return Ok(movies);
    }
}