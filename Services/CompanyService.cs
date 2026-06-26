using Hatsu.Interfaces;
using Hatsu.Models;

namespace Hatsu.Services;

public class CompanyService : Service<Company, int>, ICompanyService
{
    public CompanyService(ICompanyRepository pRepository) : base(pRepository) { }
}
