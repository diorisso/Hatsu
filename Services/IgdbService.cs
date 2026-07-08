using System.Globalization;
using System.Text;
using Hatsu.Dtos;
using Hatsu.Integrations.Igdb;
using Hatsu.Integrations.Igdb.Dtos;
using Hatsu.Interfaces;
using Hatsu.Models;

namespace Hatsu.Services;

public class IgdbService : IIgdbService
{
    private const int _PAGE_MAX = 100;
    private const string _FIELDS = "fields id,game_type,name,summary,first_release_date,total_rating_count,cover.url," +
        "involved_companies.company.name,involved_companies.developer,involved_companies.publisher,platforms.name,genres.name;";

    private readonly IIgdbApi _igdbApi;
    private readonly IGameRepository _gameRepository;
    private readonly ICompanyRepository _companyRepository;
    private readonly IPlatformRepository _platformRepository;
    private readonly IGenreRepository _genreRepository;

    public IgdbService(IIgdbApi pIgdbApi, IGameRepository pGameRepository, ICompanyRepository pCompanyRepository, IPlatformRepository pPlatformRepository, IGenreRepository pGenreRepository)
    {
        _igdbApi = pIgdbApi;
        _gameRepository = pGameRepository;
        _companyRepository = pCompanyRepository;
        _platformRepository = pPlatformRepository;
        _genreRepository = pGenreRepository;
    }

    public async Task<IReadOnlyList<GameResponse>> SearchGamesAsync(string pSearch, int pLimit = 10)
    {
        var xLimit = Math.Min(pLimit, _PAGE_MAX);
        var xSlug = ToSlug(pSearch);
        var xQuery = $"{_FIELDS} where slug ~ *\"{xSlug}\"*; sort total_rating_count desc; limit {xLimit};";
        var xIgdbGames = await _igdbApi.QueryGamesAsync(xQuery);

        var xReturn = new List<GameResponse>();
        foreach (var xIgdbGame in xIgdbGames)
        {
            var xGame = await ToGameAsync(xIgdbGame);
            xReturn.Add(ToResponse(xGame));
        }

        return xReturn;
    }

    public async Task<Game?> GetGameByIdAsync(long pId)
    {
        var xQuery = $"{_FIELDS} where id = {pId};";
        var xIgdbGames = await _igdbApi.QueryGamesAsync(xQuery);

        var xIgdbGame = xIgdbGames.FirstOrDefault();
        if (xIgdbGame == null)
            return null;

        var xReturn = await ToGameAsync(xIgdbGame);
        return xReturn;
    }

    private static string ToSlug(string pValue)
    {
        var xNormalized = pValue.Normalize(NormalizationForm.FormD);
        var xBuilder = new StringBuilder();
        foreach (var xChar in xNormalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(xChar) == UnicodeCategory.NonSpacingMark)
                continue;

            if (char.IsLetterOrDigit(xChar))
                xBuilder.Append(char.ToLowerInvariant(xChar));
            else if (xBuilder.Length > 0 && xBuilder[^1] != '-')
                xBuilder.Append('-');
        }

        var xReturn = xBuilder.ToString().Trim('-');
        return xReturn;
    }

    private static GameResponse ToResponse(Game pGame)
    {
        var xReturn = new GameResponse
        {
            Id = pGame.Id,
            Type = pGame.Type,
            Name = pGame.Name,
            Summary = pGame.Summary,
            CoverUrl = pGame.CoverUrl,
            ReleaseDate = pGame.ReleaseDate,
            Developer = pGame.Developer == null
                ? null
                : new CompanySummary { Id = pGame.Developer.Id, Name = pGame.Developer.Name },
            Publisher = pGame.Publisher == null
                ? null
                : new CompanySummary { Id = pGame.Publisher.Id, Name = pGame.Publisher.Name },
            Platforms = pGame.Platforms
                .Select(p => new PlatformSummary { Id = p.Id, Name = p.Name })
                .ToList(),
            Genres = pGame.Genres
                .Select(g => new GenreSummary { Id = g.Id, Name = g.Name })
                .ToList()
        };
        return xReturn;
    }

    private async Task<Game> ToGameAsync(IgdbGame pIgdbGame)
    {
        var xIgdbId = pIgdbGame.Id;

        var xExisting = await _gameRepository.GetByIdAsync(xIgdbId);
        if (xExisting != null)
            return xExisting;

        var xDeveloper = await ResolveCompanyAsync(pIgdbGame.InvolvedCompanies?.FirstOrDefault(p => p.Developer));
        var xPublisher = await ResolveCompanyAsync(pIgdbGame.InvolvedCompanies?.FirstOrDefault(p => p.Publisher));
        var xPlatforms = await ResolvePlatformsAsync(pIgdbGame.Platforms);
        var xGenres = await ResolveGenresAsync(pIgdbGame.Genres);

        var xGame = new Game
        {
            Id = xIgdbId,
            Type = (GameType)(pIgdbGame.GameType ?? 0),
            Name = pIgdbGame.Name,
            Summary = pIgdbGame.Summary,
            CoverUrl = BuildCoverUrl(pIgdbGame.Cover?.Url),
            ReleaseDate = pIgdbGame.FirstReleaseDate.HasValue
                ? DateTimeOffset.FromUnixTimeSeconds(pIgdbGame.FirstReleaseDate.Value).UtcDateTime
                : null,
            DeveloperId = xDeveloper?.Id,
            Developer = xDeveloper,
            PublisherId = xPublisher?.Id,
            Publisher = xPublisher,
            Platforms = xPlatforms,
            Genres = xGenres
        };

        await _gameRepository.AddAsync(xGame);
        await _gameRepository.SaveAsync();

        var xReturn = xGame;
        return xReturn;
    }

    private static string? BuildCoverUrl(string? pUrl)
    {
        if (string.IsNullOrWhiteSpace(pUrl))
            return null;

        var xUrl = pUrl.Replace("t_thumb", "t_cover_big_2x");
        if (xUrl.StartsWith("//"))
            xUrl = "https:" + xUrl;

        var xReturn = xUrl;
        return xReturn;
    }

    private async Task<Company?> ResolveCompanyAsync(IgdbInvolvedCompany? pInvolved)
    {
        if (pInvolved?.Company == null)
            return null;

        var xIgdbId = (int)pInvolved.Company.Id;

        var xExisting = await _companyRepository.GetByIdAsync(xIgdbId);
        if (xExisting != null)
            return xExisting;

        var xCompany = new Company
        {
            Id = xIgdbId,
            Name = pInvolved.Company.Name
        };

        await _companyRepository.AddAsync(xCompany);
        await _companyRepository.SaveAsync();

        var xReturn = xCompany;
        return xReturn;
    }

    private async Task<List<Platform>> ResolvePlatformsAsync(List<IgdbPlatform>? pPlatforms)
    {
        var xReturn = new List<Platform>();
        if (pPlatforms == null)
            return xReturn;

        foreach (var xIgdbPlatform in pPlatforms)
        {
            var xIgdbId = (int)xIgdbPlatform.Id;

            var xExisting = await _platformRepository.GetByIdAsync(xIgdbId);
            if (xExisting != null)
            {
                xReturn.Add(xExisting);
                continue;
            }

            var xPlatform = new Platform { Id = xIgdbId, Name = xIgdbPlatform.Name };
            await _platformRepository.AddAsync(xPlatform);
            await _platformRepository.SaveAsync();
            xReturn.Add(xPlatform);
        }

        return xReturn;
    }

    private async Task<List<Genre>> ResolveGenresAsync(List<IgdbGenre>? pGenres)
    {
        var xReturn = new List<Genre>();
        if (pGenres == null)
            return xReturn;

        foreach (var xIgdbGenre in pGenres)
        {
            var xIgdbId = (int)xIgdbGenre.Id;

            var xExisting = await _genreRepository.GetByIdAsync(xIgdbId);
            if (xExisting != null)
            {
                xReturn.Add(xExisting);
                continue;
            }

            var xGenre = new Genre { Id = xIgdbId, Name = xIgdbGenre.Name };
            await _genreRepository.AddAsync(xGenre);
            await _genreRepository.SaveAsync();
            xReturn.Add(xGenre);
        }

        return xReturn;
    }
}
