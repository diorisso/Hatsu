using Hatsu.Database;
using Hatsu.Interfaces;
using Hatsu.Models;
using Microsoft.EntityFrameworkCore;

namespace Hatsu.Repositories;

public class CompanyRepository : Repository<Company, int>, ICompanyRepository
{
    public CompanyRepository(HatsuDbContext pContext) : base(pContext.Companies, pContext) { }

    public async Task<Company?> GetByIgdbIdAsync(int pIgdbId)
    {
        var xReturn = await _dbSet
            .Where(p => !p.IsExcluded)
            .FirstOrDefaultAsync(p => p.IgdbId == pIgdbId);
        return xReturn;
    }
}
