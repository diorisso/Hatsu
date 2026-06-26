namespace Hatsu.Interfaces;

public interface IService<TEntity, TKey> where TEntity : class, ILogicExclusion, IEntity<TKey>
{
    IQueryable<TEntity> GetAll();
    Task<TEntity?> GetByIdAsync(TKey pId);
    Task<TEntity> CreateAsync(TEntity pEntity);
    Task<TEntity> UpdateAsync(TEntity pEntity);
    Task<TEntity> DeleteAsync(TKey pId);
}
