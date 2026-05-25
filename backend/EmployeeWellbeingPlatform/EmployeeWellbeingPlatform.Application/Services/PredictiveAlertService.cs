using EmployeeWellbeingPlatform.Application.DTOs.AI;
using EmployeeWellbeingPlatform.Application.Interfaces;

namespace EmployeeWellbeingPlatform.Application.Services;

public class PredictiveAlertService : IPredictiveAlertService
{
    private readonly ICheckInRepository _checkInRepository;

    public PredictiveAlertService(ICheckInRepository checkInRepository)
    {
        _checkInRepository = checkInRepository;
    }

    public async Task<List<PredictiveAlertDto>> GetEmployeePredictiveAlertsAsync(
        Guid employeeId,
        CancellationToken cancellationToken = default)
    {
        var checkIns = await _checkInRepository.GetByUserIdAsync(employeeId);

        var recentCheckIns = checkIns
            .OrderByDescending(c => c.CreatedAt)
            .Take(7)
            .OrderBy(c => c.CreatedAt)
            .ToList();

        var alerts = new List<PredictiveAlertDto>();

        if (recentCheckIns.Count < 3)
        {
            alerts.Add(new PredictiveAlertDto
            {
                Type = "InsufficientData",
                Severity = "Low",
                Title = "Not enough data yet",
                Message = "We need a few more check-ins to generate predictive wellbeing alerts.",
                Recommendation = "Continue completing your daily check-ins so the system can identify patterns."
            });

            return alerts;
        }

        var averageStress = recentCheckIns.Average(c => c.StressLevel);
        var averageEnergy = recentCheckIns.Average(c => c.EnergyLevel);

        var firstHalf = recentCheckIns.Take(recentCheckIns.Count / 2).ToList();
        var secondHalf = recentCheckIns.Skip(recentCheckIns.Count / 2).ToList();

        var stressTrend = secondHalf.Average(c => c.StressLevel) - firstHalf.Average(c => c.StressLevel);
        var energyTrend = secondHalf.Average(c => c.EnergyLevel) - firstHalf.Average(c => c.EnergyLevel);

        if (averageStress >= 8 || stressTrend >= 2)
        {
            alerts.Add(new PredictiveAlertDto
            {
                Type = "StressIncrease",
                Severity = averageStress >= 8 ? "High" : "Medium",
                Title = "Stress levels may be increasing",
                Message = "Your recent check-ins show elevated or increasing stress levels.",
                Recommendation = "Consider taking short breaks, reducing context switching, or discussing workload with your manager."
            });
        }

        if (averageEnergy <= 4 || energyTrend <= -2)
        {
            alerts.Add(new PredictiveAlertDto
            {
                Type = "LowEnergy",
                Severity = averageEnergy <= 4 ? "High" : "Medium",
                Title = "Energy levels may be low",
                Message = "Your recent check-ins indicate low or decreasing energy.",
                Recommendation = "Prioritize recovery, breaks, and realistic workload planning over the next few days."
            });
        }

        if (averageStress >= 7 && averageEnergy <= 5)
        {
            alerts.Add(new PredictiveAlertDto
            {
                Type = "BurnoutRisk",
                Severity = "High",
                Title = "Possible burnout risk detected",
                Message = "The combination of high stress and reduced energy may indicate burnout risk.",
                Recommendation = "Consider reviewing your workload and discussing support options with your manager or HR."
            });
        }

        if (HasNegativeMoodPattern(recentCheckIns))
        {
            alerts.Add(new PredictiveAlertDto
            {
                Type = "MoodConcern",
                Severity = "Medium",
                Title = "Mood pattern may need attention",
                Message = "Your recent check-ins include repeated negative mood indicators.",
                Recommendation = "Try to identify what has changed recently and consider reaching out for support if this continues."
            });
        }

        if (!alerts.Any())
        {
            alerts.Add(new PredictiveAlertDto
            {
                Type = "StableTrend",
                Severity = "Low",
                Title = "No major wellbeing risks detected",
                Message = "Your recent check-ins look relatively stable.",
                Recommendation = "Keep tracking your wellbeing regularly to maintain visibility over trends."
            });
        }

        return alerts;
    }

    private static bool HasNegativeMoodPattern(List<Domain.Entities.CheckIn> checkIns)
    {
        var negativeMoodKeywords = new[]
        {
            "sad",
            "stressed",
            "anxious",
            "tired",
            "bad",
            "overwhelmed",
            "burned",
            "burnout",
            "low"
        };

        return checkIns.Count(c =>
            !string.IsNullOrWhiteSpace(c.Mood) &&
            negativeMoodKeywords.Any(keyword =>
                c.Mood.Contains(keyword, StringComparison.OrdinalIgnoreCase))) >= 2;
    }
}