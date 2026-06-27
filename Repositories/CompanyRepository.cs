using Hatsu.Database;
using Hatsu.Interfaces;
using Hatsu.Models;

namespace Hatsu.Repositories;

public class CompanyRepository : Repository<Company, int>, ICompanyRepository
{
    public CompanyRepository(HatsuDbContext pContext) : base(pContext.Companies, pContext) { }
}
