using Hatsu.Models;

namespace Hatsu.Interfaces;

public interface ICompanyRepository : IRepository<Company, int>
{
    Task<Company?> GetByIgdbIdAsync(int pIgdbId);
}
