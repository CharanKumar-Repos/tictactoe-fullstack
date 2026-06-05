using Serilog;
using TicTacToe.API.Middleware;
using TicTacToe.API.Services;
 
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File("logs/tictactoe-.log", rollingInterval: RollingInterval.Day)
    .Enrich.FromLogContext()
    .CreateLogger();
 
try
{
    var builder = WebApplication.CreateBuilder(args);
 
    // Serilog
    builder.Host.UseSerilog();
 
    // Services
    builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        o.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
 
    builder.Services.AddSingleton<IScoreboardService, ScoreboardService>();
    builder.Services.AddSingleton<IGameService, GameService>();
 
    // Swagger
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new() { Title = "TicTacToe API", Version = "v1" });
    });
 
    // CORS — allow Angular dev server
    builder.Services.AddCors(o => o.AddPolicy("Angular", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()));
 
    var app = builder.Build();
 
    app.UseMiddleware<ExceptionHandlingMiddleware>();
 
   
     app.UseSwagger();
     app.UseSwaggerUI();    
    app.UseCors("Angular");
    app.MapControllers();
 
    Log.Information("TicTacToe API starting on {Url}", "http://localhost:5000");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application failed to start.");
}
finally
{
    Log.CloseAndFlush();
}
 