namespace Hatsu.Interfaces;

public interface IRepository<TEntity, in TKey> where TEntity : class, ILogicExclusion, IEntity<TKey>
{
    IQueryable<TEntity> ListAll();
    Task<TEntity?> GetByIdAsync(TKey pId);
    Task<TEntity?> GetByIdIncludingExcludedAsync(TKey pId);
    Task<TEntity> AddAsync(TEntity pEntity);
    Task<TEntity> UpdateAsync(TEntity pEntity);
    Task<TEntity> DeleteAsync(TKey pId);
    Task SaveAsync();
}
