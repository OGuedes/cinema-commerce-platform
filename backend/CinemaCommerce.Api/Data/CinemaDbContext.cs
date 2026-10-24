using CinemaCommerce.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CinemaCommerce.Api.Data;

public class CinemaDbContext : DbContext
{
    public CinemaDbContext(
        DbContextOptions<CinemaDbContext> options
    ) : base(options)
    {
    }

    public DbSet<Order> Orders => Set<Order>();

    public DbSet<Movie> Movies => Set<Movie>();

    public DbSet<Payment> Payments => Set<Payment>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder
    )
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Movie>().HasData(
            new Movie
            {
                Id = 1,
                Name = "Interestelar",
                UnitPrice = 32m,
                AvailableTickets = 100
            },
            new Movie
            {
                Id = 2,
                Name = "Batman",
                UnitPrice = 34m,
                AvailableTickets = 100
            },
            new Movie
            {
                Id = 3,
                Name = "Vingadores",
                UnitPrice = 30m,
                AvailableTickets = 100
            },
            new Movie
            {
                Id = 4,
                Name = "Resident Evil",
                UnitPrice = 36m,
                AvailableTickets = 100
            }
        );
    }
}
