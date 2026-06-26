using Hatsu.Database;
using Hatsu.Interfaces;
using Hatsu.Models;

namespace Hatsu.Repositories;

public class EntryRepository : Repository<Entry, int>, IEntryRepository
{
    public EntryRepository(HatsuDbContext pContext) : base(pContext.Entries, pContext) { }
}
