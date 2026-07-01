using System.Text;
using Amazon.Runtime;
using Amazon.S3;
using Hatsu.Database;
using Hatsu.Integrations.Email;
using Hatsu.Integrations.Igdb;
using Hatsu.Interfaces;
using Hatsu.Repositories;
using Hatsu.Services;
using Hatsu.Settings;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
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
builder.Services.AddScoped<IGenreRepository, GenreRepository>();

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IGameService, GameService>();
builder.Services.AddScoped<IEntryService, EntryService>();
builder.Services.AddScoped<ICompanyService, CompanyService>();
builder.Services.AddScoped<IPlatformService, PlatformService>();
builder.Services.AddScoped<IGenreService, GenreService>();

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("Email"));
builder.Services.AddTransient<ResendAuthHandler>();
builder.Services
    .AddRefitClient<IResendApi>()
    .ConfigureHttpClient(c => c.BaseAddress = new Uri("https://api.resend.com"))
    .AddHttpMessageHandler<ResendAuthHandler>();
builder.Services.AddScoped<IEmailSender, EmailSender>();

builder.Services.Configure<StorageSettings>(builder.Configuration.GetSection("Storage"));
builder.Services.AddSingleton<IAmazonS3>(pProvider =>
{
    var xSettings = pProvider.GetRequiredService<IOptions<StorageSettings>>().Value;
    var xConfig = new AmazonS3Config
    {
        ServiceURL = $"https://{xSettings.AccountId}.r2.cloudflarestorage.com",
        ForcePathStyle = true,
        RequestChecksumCalculation = RequestChecksumCalculation.WHEN_REQUIRED,
        ResponseChecksumValidation = ResponseChecksumValidation.WHEN_REQUIRED
    };
    var xCredentials = new BasicAWSCredentials(xSettings.AccessKeyId, xSettings.SecretAccessKey);
    return new AmazonS3Client(xCredentials, xConfig);
});
builder.Services.AddScoped<IStorageService, R2StorageService>();

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

var xCorsOrigins = (builder.Configuration["Cors:AllowedOrigins"] ?? string.Empty)
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(xCorsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

using (var xScope = app.Services.CreateScope())
{
    var xContext = xScope.ServiceProvider.GetRequiredService<HatsuDbContext>();
    xContext.Database.Migrate();
}

app.UseSerilogRequestLogging();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
