using Hatsu.Interfaces;
using Hatsu.Models;
using Microsoft.EntityFrameworkCore;

namespace Hatsu.Database;

public class HatsuDbContext : DbContext
{
    public HatsuDbContext(DbContextOptions<HatsuDbContext> pOptions) : base(pOptions) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Game> Games => Set<Game>();
    public DbSet<Entry> Entries => Set<Entry>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Platform> Platforms => Set<Platform>();
    public DbSet<Genre> Genres => Set<Genre>();

    public override int SaveChanges()
    {
        ApplyTimestamps();
        var xReturn = base.SaveChanges();
        return xReturn;
    }

    public override async Task<int> SaveChangesAsync(CancellationToken pCancellationToken = default)
    {
        ApplyTimestamps();
        var xReturn = await base.SaveChangesAsync(pCancellationToken);
        return xReturn;
    }

    private void ApplyTimestamps()
    {
        var xEntries = ChangeTracker.Entries<IAuditable>();
        foreach (var xEntry in xEntries)
        {
            if (xEntry.State == EntityState.Added)
            {
                xEntry.Entity.CreatedAt = DateTime.UtcNow;
                xEntry.Entity.UpdatedAt = DateTime.UtcNow;
            }
            else if (xEntry.State == EntityState.Modified)
            {
                xEntry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }
    }

    protected override void OnModelCreating(ModelBuilder pModelBuilder)
    {
        pModelBuilder.Entity<User>()
            .HasIndex(u => u.Username).IsUnique();
        pModelBuilder.Entity<User>()
            .HasIndex(u => u.Email).IsUnique();

        pModelBuilder.Entity<Game>()
            .Property(g => g.Id).ValueGeneratedNever();

        pModelBuilder.Entity<Company>()
            .Property(c => c.Id).ValueGeneratedNever();

        pModelBuilder.Entity<Platform>()
            .Property(p => p.Id).ValueGeneratedNever();

        pModelBuilder.Entity<Genre>()
            .Property(g => g.Id).ValueGeneratedNever();

        pModelBuilder.Entity<Game>()
            .HasMany(g => g.Platforms)
            .WithMany();

        pModelBuilder.Entity<Game>()
            .HasMany(g => g.Genres)
            .WithMany();

        pModelBuilder.Entity<Game>()
            .HasOne(g => g.Developer)
            .WithMany(c => c.GamesDeveloped)
            .HasForeignKey(g => g.DeveloperId)
            .OnDelete(DeleteBehavior.Restrict);

        pModelBuilder.Entity<Game>()
            .HasOne(g => g.Publisher)
            .WithMany(c => c.GamesPublished)
            .HasForeignKey(g => g.PublisherId)
            .OnDelete(DeleteBehavior.Restrict);

        pModelBuilder.Entity<Entry>()
            .HasIndex(e => new { e.UserId, e.GameId }).IsUnique();
    }
}
