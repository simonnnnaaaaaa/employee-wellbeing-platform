using EmployeeWellbeingPlatform.Application.HR.Dtos;
using EmployeeWellbeingPlatform.Application.Interfaces;
using EmployeeWellbeingPlatform.Domain.Entities;
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

        var endDate = DateTime.UtcNow;
        var startDate = endDate.AddDays(-days);

        return await GetDashboardAsync(startDate, endDate);
    }

    public async Task<HRDashboardResponseDto> GetDashboardAsync(DateTime startDate, DateTime endDate)
    {
        if (endDate <= startDate)
        {
            endDate = startDate.AddDays(1);
        }

        var periodLength = endDate - startDate;
        var previousPeriodStart = startDate - periodLength;
        var previousPeriodEnd = startDate;

        var currentCheckIns = await _context.CheckIns
            .Include(c => c.User)
            .ThenInclude(u => u.Department)
            .Where(c => c.CreatedAt >= startDate && c.CreatedAt <= endDate)
            .ToListAsync();

        var previousCheckIns = await _context.CheckIns
            .Where(c =>
                c.CreatedAt >= previousPeriodStart &&
                c.CreatedAt < previousPeriodEnd)
            .ToListAsync();

        return BuildDashboardResponse(currentCheckIns, previousCheckIns);
    }

    private static HRDashboardResponseDto BuildDashboardResponse(
        List<CheckIn> currentCheckIns,
        List<CheckIn> previousCheckIns)
    {
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
                    var departmentAverageStress = group.Average(c => c.StressLevel);
                    var departmentAverageEnergy = group.Average(c => c.EnergyLevel);
                    var departmentHighStressCount = group.Count(c => c.StressLevel >= 8);

                    var highStressPercentage = totalDepartmentCheckIns > 0
                        ? (double)departmentHighStressCount / totalDepartmentCheckIns * 100
                        : 0;

                    var riskScore = CalculateDepartmentRiskScore(
                        departmentAverageStress,
                        departmentAverageEnergy,
                        highStressPercentage);

                    return new DepartmentWellbeingSummaryDto
                    {
                        Department = group.Key,
                        TotalCheckIns = totalDepartmentCheckIns,
                        AverageStress = departmentAverageStress,
                        AverageEnergy = departmentAverageEnergy,
                        HighStressCount = departmentHighStressCount,
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