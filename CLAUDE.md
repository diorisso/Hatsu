# Hatsu

ASP.NET Core Web API (.NET) backing a game-tracking app, using EF Core with PostgreSQL (Npgsql).

## Architecture

- `Models/` — entities. All derive from the abstract `Entity<TKey>` base class (`Models/Entity.cs`), which implements `IEntity<TKey>` (`Id`) and `ILogicExclusion` (`IsExcluded`, soft deletes) and adds `CreatedAt`/`UpdatedAt` timestamps. New entities should inherit `Entity<int>` rather than re-declaring these.
- `Interfaces/` — contracts: entity marker interfaces, plus `IRepository`/`IService` generics and one interface per entity for each layer.
- `Repositories/` — data access. `Repository<TEntity, TKey>` is the abstract base; one concrete repo per entity. Soft-deleted rows (`IsExcluded == true`) are filtered out of all reads.
- `Services/` — business logic. `Service<TEntity, TKey>` is the abstract base; one concrete service per entity. Services own the transaction boundary (commit).
- `Controllers/` — thin ASP.NET Core controllers; they delegate to services and translate domain errors to HTTP results.
- `Dtos/` — request/response contracts (e.g. `RegisterRequest`, `LoginRequest`, `AuthResponse`).
- `Settings/` — strongly-typed config POCOs bound from configuration (e.g. `JwtSettings` from the `Jwt` section).
- `Integrations/` — external API clients. `Integrations/Igdb` holds the **Refit** clients for the IGDB API.
- `Database/HatsuDbContext.cs` — EF Core `DbContext`.

## External APIs (IGDB)

- IGDB is consumed via **Refit** typed clients registered with `AddRefitClient` in `Program.cs`.
- IGDB requires Twitch OAuth: `IgdbTokenProvider` (singleton) fetches and caches a client-credentials token via `ITwitchAuthApi`; `IgdbAuthHandler` (a `DelegatingHandler`) attaches the `Client-ID` header and `Bearer` token to every IGDB request.
- Queries use IGDB's Apicalypse syntax sent as a raw `string` body (`[Body] string`). `IgdbService` builds the queries; `GamesController` exposes `GET /api/games/search`.
- **Search persists as it reads:** `IgdbService.SearchGamesAsync` maps each IGDB result into the domain `Game`/`Company` entities and upserts them (dedup by `IgdbId`, which both `Game` and `Company` carry with a unique index), then returns the saved `Game` entities. Involved companies become `Company` rows wired to `Game.Developer`/`Game.Publisher` (both nullable, since IGDB data may omit them). JSON cycles from the entity nav properties are handled by `ReferenceHandler.IgnoreCycles` on the controllers' JSON options.
- Credentials live under the `Igdb` section of `appsettings.json` (`ClientId`/`ClientSecret`) — replace the placeholders with real Twitch app credentials; keep secrets out of source control.

## Auth

- JWT bearer authentication. `AuthController` exposes `POST /api/auth/register` and `POST /api/auth/login`, both returning an `AuthResponse` (token + expiry).
- `AuthService` handles register/login; passwords are hashed with ASP.NET Core's `PasswordHasher<User>`. `TokenService` issues the JWT from `JwtSettings`.
- The signing key lives under the `Jwt` section in `appsettings.json` — replace the placeholder with a real secret (≥ 32 chars) per environment; don't commit production secrets.
- Each entity is wired into DI in `Program.cs` against its interface (repository and service).

## Naming conventions

These are strict — follow them in all C# code:

- **Method parameters** are prefixed with `p` — e.g. `pId`, `pEntity`, `pContext`.
- **Local variables** are prefixed with `x` — e.g. `xEntity`, `xUser`.
- **Never return an expression directly.** Always assign to a local `xReturn` variable first, then return it:

  ```csharp
  public TEntity? GetById(TKey pId)
  {
      var xReturn = _repository.GetById(pId);
      return xReturn;
  }
  ```

- Private fields are prefixed with `_` (e.g. `_dbSet`, `_context`).
- Data-access and service methods are **async** and carry the `Async` suffix (e.g. `GetByIdAsync`, `CreateAsync`). Use EF Core's async APIs (`ToListAsync`, `FirstOrDefaultAsync`, `SaveChangesAsync`).
- **Never write comments.** Code should be self-explanatory through clear naming; do not add `//` or `/* */` comments.

## Logging

- Logging uses **Serilog** (configured in `Program.cs` via `UseSerilog`, levels read from the `Serilog` section of `appsettings.json`).
- HTTP requests are logged automatically via `app.UseSerilogRequestLogging()`.
- The console `ExpressionTemplate` automatically prefixes every line with `[ClassName]` (the short `SourceContext`) and wraps the message in `[]`. **Do not hardcode the class name or brackets in log messages** — just write the structured message and inject `ILogger<T>` (whose `T` provides the class name).
- **Every `catch` block must log the exception** through the injected `ILogger<T>` before handling it — use `LogWarning`/`LogError` with the exception as the first argument and a structured message, e.g. `_logger.LogWarning(xEx, "Falha ao autenticar usuário com e-mail {Email}", pRequest.Email)`.

## Conventions

- Adding a new entity means adding, for that entity: a model, a repository interface + class, a service interface + class, and DI registrations in `Program.cs`.
- Reads are soft-delete aware: query through the repository so `IsExcluded` filtering is applied.
