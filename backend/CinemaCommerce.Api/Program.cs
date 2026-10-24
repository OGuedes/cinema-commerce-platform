using CinemaCommerce.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

string connectionString =
    builder.Configuration.GetConnectionString("CinemaDatabase")
    ?? throw new InvalidOperationException(
        "A conexão CinemaDatabase não foi configurada."
    );

builder.Services.AddDbContext<CinemaDbContext>(options =>
    options.UseSqlite(connectionString)
);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();