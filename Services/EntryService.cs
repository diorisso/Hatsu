using Hatsu.Interfaces;
using Hatsu.Models;

namespace Hatsu.Services;

public class EntryService : Service<Entry, int>, IEntryService
{
    public EntryService(IEntryRepository pRepository) : base(pRepository) { }
}
