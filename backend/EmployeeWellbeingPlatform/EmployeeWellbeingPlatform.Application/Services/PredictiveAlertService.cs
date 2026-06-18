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

    public async Task<List<HrPredictiveAlertDto>> GetHrPredictiveAlertsAsync(
    int days,
    CancellationToken cancellationToken = default)
    {
        var checkIns = await _checkInRepository.GetAllAsync();

        var recentCheckIns = checkIns
            .Where(c => c.CreatedAt >= DateTime.UtcNow.AddDays(-days))
            .ToList();

        var alerts = new List<HrPredictiveAlertDto>();

        if (recentCheckIns.Count < 5)
        {
            alerts.Add(new HrPredictiveAlertDto
            {
                Type = "InsufficientData",
                Severity = "Low",
                Title = "Not enough organizational data yet",
                Message = "There are not enough recent check-ins to generate reliable HR predictive alerts.",
                Recommendation = "Encourage employees to complete regular check-ins before drawing organizational conclusions.",
                AffectedEmployeesCount = 0
            });

            return alerts;
        }

        var employeeGroups = recentCheckIns
            .GroupBy(c => c.UserId)
            .ToList();

        var highStressEmployees = employeeGroups
            .Where(g => g.Average(c => c.StressLevel) >= 7)
            .Count();

        var lowEnergyEmployees = employeeGroups
            .Where(g => g.Average(c => c.EnergyLevel) <= 4)
            .Count();

        var negativeMoodEmployees = employeeGroups
            .Where(g => g.Count(c =>
                !string.IsNullOrWhiteSpace(c.Mood) &&
                IsNegativeMood(c.Mood)) >= 2)
            .Count();

        if (highStressEmployees >= 2)
        {
            alerts.Add(new HrPredictiveAlertDto
            {
                Type = "OrganizationalStressRisk",
                Severity = highStressEmployees >= 5 ? "High" : "Medium",
                Title = "Elevated stress pattern detected",
                Message = $"{highStressEmployees} employees show elevated stress levels in recent check-ins.",
                Recommendation = "Review workload distribution, deadlines, and team capacity in the affected areas.",
                AffectedEmployeesCount = highStressEmployees
            });
        }

        if (lowEnergyEmployees >= 2)
        {
            alerts.Add(new HrPredictiveAlertDto
            {
                Type = "LowEnergyPattern",
                Severity = lowEnergyEmployees >= 5 ? "High" : "Medium",
                Title = "Low energy trend detected",
                Message = $"{lowEnergyEmployees} employees show consistently low energy levels.",
                Recommendation = "Consider wellbeing initiatives focused on recovery, workload balance, and meeting fatigue.",
                AffectedEmployeesCount = lowEnergyEmployees
            });
        }

        if (negativeMoodEmployees >= 2)
        {
            alerts.Add(new HrPredictiveAlertDto
            {
                Type = "NegativeMoodPattern",
                Severity = negativeMoodEmployees >= 5 ? "High" : "Medium",
                Title = "Negative mood pattern detected",
                Message = $"{negativeMoodEmployees} employees reported repeated negative mood indicators.",
                Recommendation = "Monitor team sentiment and consider anonymous feedback or manager check-ins.",
                AffectedEmployeesCount = negativeMoodEmployees
            });
        }

        if (!alerts.Any())
        {
            alerts.Add(new HrPredictiveAlertDto
            {
                Type = "StableOrganizationTrend",
                Severity = "Low",
                Title = "No major organizational risks detected",
                Message = "Recent check-ins do not show major predictive wellbeing risks at organizational level.",
                Recommendation = "Continue monitoring trends and encouraging regular check-ins.",
                AffectedEmployeesCount = 0
            });
        }

        return alerts;
    }

    private static bool IsNegativeMood(string mood)
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

        return negativeMoodKeywords.Any(keyword =>
            mood.Contains(keyword, StringComparison.OrdinalIgnoreCase));
    }

    private static bool HasNegativeMoodPattern(List<Domain.Entities.CheckIn> checkIns)
    {
        return checkIns.Count(c =>
        !string.IsNullOrWhiteSpace(c.Mood) &&
        IsNegativeMood(c.Mood)) >= 2;
    }
}