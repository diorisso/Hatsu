using Hatsu.Interfaces;
using Hatsu.Models;

namespace Hatsu.Services;

public class GenreService : Service<Genre, int>, IGenreService
{
    public GenreService(IGenreRepository pRepository) : base(pRepository) { }
}
