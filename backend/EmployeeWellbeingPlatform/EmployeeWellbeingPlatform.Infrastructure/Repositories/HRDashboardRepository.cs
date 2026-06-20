using EmployeeWellbeingPlatform.Application.HR.Dtos;
using EmployeeWellbeingPlatform.Application.Interfaces;
using EmployeeWellbeingPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EmployeeWellbeingPlatform.Infrastructure.Repositories;

public class HRDashboardRepository : IHRDashboardRepository
{
    private readonly AppDbContext _context;

    public HRDashboardRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<HRDashboardResponseDto> GetDashboardAsync(int days)
    {
        if (days <= 0)
        {
            days = 30;
        }

        var currentPeriodStart = DateTime.UtcNow.AddDays(-days);
        var previousPeriodStart = DateTime.UtcNow.AddDays(-(days * 2));
        var previousPeriodEnd = currentPeriodStart;

        var currentCheckIns = await _context.CheckIns
            .Include(c => c.User)
            .ThenInclude(u => u.Department)
            .Where(c => c.CreatedAt >= currentPeriodStart)
            .ToListAsync();

        var previousCheckIns = await _context.CheckIns
            .Where(c =>
                c.CreatedAt >= previousPeriodStart &&
                c.CreatedAt < previousPeriodEnd)
            .ToListAsync();

        var totalCheckIns = currentCheckIns.Count;

        var averageStress = totalCheckIns > 0
            ? currentCheckIns.Average(c => c.StressLevel)
            : 0;

        var averageEnergy = totalCheckIns > 0
            ? currentCheckIns.Average(c => c.EnergyLevel)
            : 0;

        var highStressCount = currentCheckIns.Count(c => c.StressLevel >= 8);

        var previousAverageStress = previousCheckIns.Count > 0
            ? previousCheckIns.Average(c => c.StressLevel)
            : 0;

        var previousAverageEnergy = previousCheckIns.Count > 0
            ? previousCheckIns.Average(c => c.EnergyLevel)
            : 0;

        var previousHighStressCount = previousCheckIns.Count(c => c.StressLevel >= 8);

        return new HRDashboardResponseDto
        {
            TotalCheckIns = totalCheckIns,
            AverageStress = averageStress,
            AverageEnergy = averageEnergy,
            HighStressCount = highStressCount,

            StressTrendPercentage = CalculateTrendPercentage(
                averageStress,
                previousAverageStress),

            EnergyTrendPercentage = CalculateTrendPercentage(
                averageEnergy,
                previousAverageEnergy),

            HighStressTrendPercentage = CalculateTrendPercentage(
                highStressCount,
                previousHighStressCount),

            MoodDistribution = currentCheckIns
                .Where(c => !string.IsNullOrWhiteSpace(c.Mood))
                .GroupBy(c => c.Mood)
                .Select(group => new MoodDistributionDto
                {
                     Mood = group.Key,
                     Count = group.Count(),
                     Percentage = totalCheckIns > 0
                        ? Math.Round((double)group.Count() / totalCheckIns * 100, 1)
                        : 0
                })
                .OrderByDescending(item => item.Count)
                .ToList(),

            Departments = currentCheckIns
                .GroupBy(c => c.User.Department != null ? c.User.Department.Name : "Unassigned")
                .Select(group =>
                {
                    var totalDepartmentCheckIns = group.Count();
                    var averageStress = group.Average(c => c.StressLevel);
                    var averageEnergy = group.Average(c => c.EnergyLevel);
                    var highStressCount = group.Count(c => c.StressLevel >= 8);

                    var highStressPercentage = totalDepartmentCheckIns > 0
                        ? (double)highStressCount / totalDepartmentCheckIns * 100
                        : 0;

                    var riskScore = CalculateDepartmentRiskScore(
                        averageStress,
                        averageEnergy,
                        highStressPercentage);

                    return new DepartmentWellbeingSummaryDto
                    {
                        Department = group.Key,
                        TotalCheckIns = totalDepartmentCheckIns,
                        AverageStress = averageStress,
                        AverageEnergy = averageEnergy,
                        HighStressCount = highStressCount,
                        RiskScore = riskScore,
                        RiskLevel = GetDepartmentRiskLevel(riskScore)
                    };
                })
                .ToList()
        };
    }

    private static double CalculateTrendPercentage(
        double currentValue,
        double previousValue)
    {
        if (previousValue == 0)
        {
            return currentValue > 0 ? 100 : 0;
        }

        return ((currentValue - previousValue) / previousValue) * 100;
    }

    private static double CalculateDepartmentRiskScore(
    double averageStress,
    double averageEnergy,
    double highStressPercentage)
    {
        var score =
            averageStress * 7
            + (10 - averageEnergy) * 5
            + highStressPercentage * 0.5;

        return Math.Round(Math.Min(score, 100), 1);
    }

    private static string GetDepartmentRiskLevel(double riskScore)
    {
        if (riskScore < 30)
        {
            return "Low";
        }

        if (riskScore < 60)
        {
            return "Moderate";
        }

        if (riskScore < 80)
        {
            return "High";
        }

        return "Critical";
    }
}