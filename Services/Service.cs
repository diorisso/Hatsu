using Hatsu.Interfaces;

namespace Hatsu.Services;

public abstract class Service<TEntity, TKey> : IService<TEntity, TKey> where TEntity : class, ILogicExclusion, IEntity<TKey>
{
    private readonly IRepository<TEntity, TKey> _repository;

    protected Service(IRepository<TEntity, TKey> pRepository)
    {
        _repository = pRepository;
    }

    public IQueryable<TEntity> GetAll()
    {
        var xReturn = _repository.ListAll();
        return xReturn;
    }

    public async Task<TEntity?> GetByIdAsync(TKey pId)
    {
        var xReturn = await _repository.GetByIdAsync(pId);
        return xReturn;
    }

    public async Task<TEntity> CreateAsync(TEntity pEntity)
    {
        var xReturn = await _repository.AddAsync(pEntity);
        await _repository.SaveAsync();
        return xReturn;
    }

    public async Task<TEntity> UpdateAsync(TEntity pEntity)
    {
        var xReturn = await _repository.UpdateAsync(pEntity);
        await _repository.SaveAsync();
        return xReturn;
    }

    public async Task<TEntity> DeleteAsync(TKey pId)
    {
        var xReturn = await _repository.DeleteAsync(pId);
        await _repository.SaveAsync();
        return xReturn;
    }
}
