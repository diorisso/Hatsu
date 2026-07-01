using Hatsu.Database;
using Hatsu.Interfaces;
using Hatsu.Models;

namespace Hatsu.Repositories;

public class GenreRepository : Repository<Genre, int>, IGenreRepository
{
    public GenreRepository(HatsuDbContext pContext) : base(pContext.Genres, pContext) { }
}
