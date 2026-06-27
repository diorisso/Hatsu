using Hatsu.Dtos;
using Hatsu.Interfaces;
using Hatsu.Models;

namespace Hatsu.Services;

public class EntryService : Service<Entry, int>, IEntryService
{
    private readonly IEntryRepository _repository;
    private readonly IGameService _gameService;

    public EntryService(IEntryRepository pRepository, IGameService pGameService) : base(pRepository)
    {
        _repository = pRepository;
        _gameService = pGameService;
    }

    public async Task<Entry> CreateAsync(int pUserId, CreateEntryRequest pRequest)
    {
        var xExisting = await _repository.GetByUserAndGameAsync(pUserId, pRequest.GameId);
        if (xExisting != null)
            throw new InvalidOperationException("An entry for this game already exists.");

        var xGame = await _gameService.GetByIdAsync(pRequest.GameId);
        if (xGame == null)
            throw new KeyNotFoundException("Game not found.");

        var xEntry = new Entry
        {
            UserId = pUserId,
            GameId = pRequest.GameId,
            Status = pRequest.Status,
            Rating = pRequest.Rating,
            Notes = pRequest.Notes
        };

        var xReturn = await base.CreateAsync(xEntry);
        return xReturn;
    }

    public async Task<IReadOnlyList<Entry>> ListByUserAsync(int pUserId)
    {
        var xReturn = await _repository.ListByUserAsync(pUserId);
        return xReturn;
    }

    public async Task<Entry> UpdateAsync(int pUserId, int pId, UpdateEntryRequest pRequest)
    {
        var xEntry = await _repository.GetByIdAsync(pId);
        if (xEntry == null || xEntry.UserId != pUserId)
            throw new KeyNotFoundException("Entry not found.");

        if (pRequest.Status.IsSpecified && pRequest.Status.Value.HasValue)
            xEntry.Status = pRequest.Status.Value.Value;

        if (pRequest.Rating.IsSpecified)
            xEntry.Rating = pRequest.Rating.Value;

        if (pRequest.Notes.IsSpecified)
            xEntry.Notes = pRequest.Notes.Value;

        var xReturn = await base.UpdateAsync(xEntry);
        return xReturn;
    }

    public async Task DeleteAsync(int pUserId, int pId)
    {
        var xEntry = await _repository.GetByIdAsync(pId);
        if (xEntry == null || xEntry.UserId != pUserId)
            throw new KeyNotFoundException("Entry not found.");

        await base.DeleteAsync(pId);
    }
}
