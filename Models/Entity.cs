using Hatsu.Interfaces;

namespace Hatsu.Models;

public abstract class Entity<TKey> : IEntity<TKey>, ILogicExclusion, IAuditable
{
    public TKey Id { get; set; } = default!;
    public bool IsExcluded { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
