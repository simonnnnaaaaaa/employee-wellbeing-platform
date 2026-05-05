using EmployeeWellbeingPlatform.Domain.Entities;
using EmployeeWellbeingPlatform.Infrastructure.Data;
using EmployeeWellbeingPlatform.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace EmployeeWellbeingPlatform.UnitTests.HR;

public class HRDashboardRepositoryTests
{
    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetDashboardAsync_WhenNoCheckIns_ShouldReturnEmptyDashboard()
    {
        // Arrange
        await using var context = CreateDbContext();
        var repository = new HRDashboardRepository(context);

        // Act
        var result = await repository.GetDashboardAsync();

        // Assert
        Assert.Equal(0, result.TotalCheckIns);
        Assert.Equal(0, result.AverageStress);
        Assert.Equal(0, result.AverageEnergy);
        Assert.Equal(0, result.HighStressCount);
        Assert.Empty(result.Departments);
    }

    [Fact]
    public async Task GetDashboardAsync_ShouldCalculateCompanyOverviewCorrectly()
    {
        // Arrange
        await using var context = CreateDbContext();

        var department = new Department
        {
            Id = Guid.NewGuid(),
            Name = "IT"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Ana",
            LastName = "Popescu",
            Email = "ana@test.com",
            PasswordHash = "hash",
            Role = "Employee",
            Department = department,
            DepartmentId = department.Id,
            CreatedAt = DateTime.UtcNow
        };

        context.Departments.Add(department);
        context.Users.Add(user);

        context.CheckIns.AddRange(
            new CheckIn
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                User = user,
                StressLevel = 8,
                EnergyLevel = 4,
                Mood = "Stressed",
                CreatedAt = DateTime.UtcNow
            },
            new CheckIn
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                User = user,
                StressLevel = 6,
                EnergyLevel = 6,
                Mood = "Neutral",
                CreatedAt = DateTime.UtcNow
            }
        );

        await context.SaveChangesAsync();

        var repository = new HRDashboardRepository(context);

        // Act
        var result = await repository.GetDashboardAsync();

        // Assert
        Assert.Equal(2, result.TotalCheckIns);
        Assert.Equal(7, result.AverageStress);
        Assert.Equal(5, result.AverageEnergy);
        Assert.Equal(1, result.HighStressCount);
    }

    [Fact]
    public async Task GetDashboardAsync_ShouldGroupCheckInsByDepartment()
    {
        // Arrange
        await using var context = CreateDbContext();

        var itDepartment = new Department
        {
            Id = Guid.NewGuid(),
            Name = "IT"
        };

        var hrDepartment = new Department
        {
            Id = Guid.NewGuid(),
            Name = "HR"
        };

        var itUser = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Ana",
            LastName = "Popescu",
            Email = "ana@test.com",
            PasswordHash = "hash",
            Role = "Employee",
            Department = itDepartment,
            DepartmentId = itDepartment.Id,
            CreatedAt = DateTime.UtcNow
        };

        var hrUser = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Maria",
            LastName = "Ionescu",
            Email = "maria@test.com",
            PasswordHash = "hash",
            Role = "HR",
            Department = hrDepartment,
            DepartmentId = hrDepartment.Id,
            CreatedAt = DateTime.UtcNow
        };

        context.Departments.AddRange(itDepartment, hrDepartment);
        context.Users.AddRange(itUser, hrUser);

        context.CheckIns.AddRange(
            new CheckIn
            {
                Id = Guid.NewGuid(),
                UserId = itUser.Id,
                User = itUser,
                StressLevel = 9,
                EnergyLevel = 3,
                Mood = "Stressed",
                CreatedAt = DateTime.UtcNow
            },
            new CheckIn
            {
                Id = Guid.NewGuid(),
                UserId = itUser.Id,
                User = itUser,
                StressLevel = 7,
                EnergyLevel = 5,
                Mood = "Tired",
                CreatedAt = DateTime.UtcNow
            },
            new CheckIn
            {
                Id = Guid.NewGuid(),
                UserId = hrUser.Id,
                User = hrUser,
                StressLevel = 4,
                EnergyLevel = 8,
                Mood = "Happy",
                CreatedAt = DateTime.UtcNow
            }
        );

        await context.SaveChangesAsync();

        var repository = new HRDashboardRepository(context);

        // Act
        var result = await repository.GetDashboardAsync();

        // Assert
        Assert.Equal(2, result.Departments.Count);

        var itSummary = result.Departments.Single(d => d.Department == "IT");
        Assert.Equal(2, itSummary.TotalCheckIns);
        Assert.Equal(8, itSummary.AverageStress);
        Assert.Equal(4, itSummary.AverageEnergy);
        Assert.Equal(1, itSummary.HighStressCount);

        var hrSummary = result.Departments.Single(d => d.Department == "HR");
        Assert.Equal(1, hrSummary.TotalCheckIns);
        Assert.Equal(4, hrSummary.AverageStress);
        Assert.Equal(8, hrSummary.AverageEnergy);
        Assert.Equal(0, hrSummary.HighStressCount);
    }

    [Fact]
    public async Task GetDashboardAsync_WhenUserHasNoDepartment_ShouldGroupAsUnassigned()
    {
        // Arrange
        await using var context = CreateDbContext();

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Alex",
            LastName = "Marin",
            Email = "alex@test.com",
            PasswordHash = "hash",
            Role = "Employee",
            DepartmentId = null,
            Department = null,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(user);

        context.CheckIns.Add(new CheckIn
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            User = user,
            StressLevel = 5,
            EnergyLevel = 7,
            Mood = "Neutral",
            CreatedAt = DateTime.UtcNow
        });

        await context.SaveChangesAsync();

        var repository = new HRDashboardRepository(context);

        // Act
        var result = await repository.GetDashboardAsync();

        // Assert
        Assert.Single(result.Departments);

        var summary = result.Departments.Single();
        Assert.Equal("Unassigned", summary.Department);
        Assert.Equal(1, summary.TotalCheckIns);
        Assert.Equal(5, summary.AverageStress);
        Assert.Equal(7, summary.AverageEnergy);
        Assert.Equal(0, summary.HighStressCount);
    }
}