using Hatsu.Database;
using Hatsu.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hatsu.Repositories;

public abstract class Repository<TEntity, TKey> : IRepository<TEntity, TKey> where TEntity : class, ILogicExclusion, IEntity<TKey>
{
    protected readonly DbSet<TEntity> _dbSet;
    private readonly HatsuDbContext _context;

    public Repository(DbSet<TEntity> pDbSet, HatsuDbContext pContext)
    {
        _dbSet = pDbSet;
        _context = pContext;
    }

    public IQueryable<TEntity> ListAll()
    {
        var xReturn = _dbSet.Where(p => !p.IsExcluded);
        return xReturn;
    }

    public virtual async Task<TEntity?> GetByIdAsync(TKey pId)
    {
        var xReturn = await _dbSet
            .Where(p => !p.IsExcluded)
            .FirstOrDefaultAsync(p => p.Id.Equals(pId));
        return xReturn;
    }

    public async Task<TEntity?> GetByIdIncludingExcludedAsync(TKey pId)
    {
        var xReturn = await _dbSet.FirstOrDefaultAsync(p => p.Id.Equals(pId));
        return xReturn;
    }

    public async Task<TEntity> AddAsync(TEntity pEntity)
    {
        await _dbSet.AddAsync(pEntity);
        return pEntity;
    }

    public Task<TEntity> UpdateAsync(TEntity pEntity)
    {
        _dbSet.Update(pEntity);
        return Task.FromResult(pEntity);
    }

    public async Task<TEntity> DeleteAsync(TKey pId)
    {
        var xReturn = await GetByIdAsync(pId);
        if (xReturn == null)
            throw new KeyNotFoundException("Record not found.");

        xReturn.IsExcluded = true;
        _dbSet.Update(xReturn);
        return xReturn;
    }

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }
}