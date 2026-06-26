using System.Text;
using Hatsu.Database;
using Hatsu.Integrations.Igdb;
using Hatsu.Interfaces;
using Hatsu.Repositories;
using Hatsu.Services;
using Hatsu.Settings;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json.Serialization;
using Refit;
using Serilog;
using Serilog.Templates;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console(new ExpressionTemplate(
        "[{@t:yyyy-MM-dd HH:mm:ss.fff} {@l:u3}] " +
        "[{Coalesce(Substring(SourceContext, LastIndexOf(SourceContext, '.') + 1), 'App')}] " +
        "[{@m}]\n{@x}")));

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

builder.Services.AddDbContext<HatsuDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("HatsuContext")));

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IGameRepository, GameRepository>();
builder.Services.AddScoped<IEntryRepository, EntryRepository>();
builder.Services.AddScoped<ICompanyRepository, CompanyRepository>();
builder.Services.AddScoped<IPlatformRepository, PlatformRepository>();

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IGameService, GameService>();
builder.Services.AddScoped<IEntryService, EntryService>();
builder.Services.AddScoped<ICompanyService, CompanyService>();
builder.Services.AddScoped<IPlatformService, PlatformService>();

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.Configure<IgdbSettings>(builder.Configuration.GetSection("Igdb"));
builder.Services.AddSingleton<IgdbTokenProvider>();
builder.Services.AddTransient<IgdbAuthHandler>();

builder.Services
    .AddRefitClient<ITwitchAuthApi>()
    .ConfigureHttpClient(c => c.BaseAddress = new Uri("https://id.twitch.tv"));

builder.Services
    .AddRefitClient<IIgdbApi>()
    .ConfigureHttpClient(c => c.BaseAddress = new Uri("https://api.igdb.com"))
    .AddHttpMessageHandler<IgdbAuthHandler>();

builder.Services.AddScoped<IIgdbService, IgdbService>();

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));
var xJwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()!;

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = xJwtSettings.Issuer,
            ValidAudience = xJwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(xJwtSettings.Key))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseSerilogRequestLogging();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
