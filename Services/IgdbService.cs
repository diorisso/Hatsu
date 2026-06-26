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
    private const string _FIELDS = "fields id,name,summary,first_release_date,total_rating_count,cover.url," +
        "involved_companies.company.name,involved_companies.developer,involved_companies.publisher,platforms.name;";

    private readonly IIgdbApi _igdbApi;
    private readonly IGameRepository _gameRepository;
    private readonly ICompanyRepository _companyRepository;
    private readonly IPlatformRepository _platformRepository;

    public IgdbService(IIgdbApi pIgdbApi, IGameRepository pGameRepository, ICompanyRepository pCompanyRepository, IPlatformRepository pPlatformRepository)
    {
        _igdbApi = pIgdbApi;
        _gameRepository = pGameRepository;
        _companyRepository = pCompanyRepository;
        _platformRepository = pPlatformRepository;
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
            IgdbId = pGame.IgdbId,
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
                .ToList()
        };
        return xReturn;
    }

    private async Task<Game> ToGameAsync(IgdbGame pIgdbGame)
    {
        var xIgdbId = (int)pIgdbGame.Id;

        var xExisting = await _gameRepository.GetByIgdbIdAsync(xIgdbId);
        if (xExisting != null)
            return xExisting;

        var xDeveloper = await ResolveCompanyAsync(pIgdbGame.InvolvedCompanies?.FirstOrDefault(p => p.Developer));
        var xPublisher = await ResolveCompanyAsync(pIgdbGame.InvolvedCompanies?.FirstOrDefault(p => p.Publisher));
        var xPlatforms = await ResolvePlatformsAsync(pIgdbGame.Platforms);

        var xGame = new Game
        {
            IgdbId = xIgdbId,
            Name = pIgdbGame.Name,
            Summary = pIgdbGame.Summary,
            CoverUrl = pIgdbGame.Cover?.Url,
            ReleaseDate = pIgdbGame.FirstReleaseDate.HasValue
                ? DateTimeOffset.FromUnixTimeSeconds(pIgdbGame.FirstReleaseDate.Value).UtcDateTime
                : null,
            DeveloperId = xDeveloper?.Id,
            Developer = xDeveloper,
            PublisherId = xPublisher?.Id,
            Publisher = xPublisher,
            Platforms = xPlatforms
        };

        await _gameRepository.AddAsync(xGame);
        await _gameRepository.SaveAsync();

        var xReturn = xGame;
        return xReturn;
    }

    private async Task<Company?> ResolveCompanyAsync(IgdbInvolvedCompany? pInvolved)
    {
        if (pInvolved?.Company == null)
            return null;

        var xIgdbId = (int)pInvolved.Company.Id;

        var xExisting = await _companyRepository.GetByIgdbIdAsync(xIgdbId);
        if (xExisting != null)
            return xExisting;

        var xCompany = new Company
        {
            IgdbId = xIgdbId,
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

            var xExisting = await _platformRepository.GetByIgdbIdAsync(xIgdbId);
            if (xExisting != null)
            {
                xReturn.Add(xExisting);
                continue;
            }

            var xPlatform = new Platform { IgdbId = xIgdbId, Name = xIgdbPlatform.Name };
            await _platformRepository.AddAsync(xPlatform);
            await _platformRepository.SaveAsync();
            xReturn.Add(xPlatform);
        }

        return xReturn;
    }
}
