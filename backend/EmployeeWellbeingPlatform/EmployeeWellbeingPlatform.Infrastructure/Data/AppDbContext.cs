using EmployeeWellbeingPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EmployeeWellbeingPlatform.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<CheckIn> CheckIns { get; set; }
    public DbSet<Department> Departments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasOne(user => user.Department)
            .WithMany(department => department.Users)
            .HasForeignKey(user => user.DepartmentId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<CheckIn>()
            .HasOne(checkIn => checkIn.User)
            .WithMany(user => user.CheckIns)
            .HasForeignKey(checkIn => checkIn.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}