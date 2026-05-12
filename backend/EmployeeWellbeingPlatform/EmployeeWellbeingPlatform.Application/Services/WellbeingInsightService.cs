using EmployeeWellbeingPlatform.Application.Ai;
using EmployeeWellbeingPlatform.Application.Ai.Dtos;
using EmployeeWellbeingPlatform.Application.Interfaces;

namespace EmployeeWellbeingPlatform.Application.Services;

public class WellbeingInsightService
{
    private readonly ICheckInRepository _checkInRepository;
    private readonly IWellbeingAiTextGenerator _aiTextGenerator;

    public WellbeingInsightService(
    ICheckInRepository checkInRepository,
    IWellbeingAiTextGenerator aiTextGenerator)
    {
        _checkInRepository = checkInRepository;
        _aiTextGenerator = aiTextGenerator;
    }

    public async Task<WellbeingInsightResponseDto> GetMyInsightAsync(Guid userId)
    {
        var checkIns = await _checkInRepository.GetByUserIdAsync(userId);

        var recentCheckIns = checkIns
            .OrderByDescending(c => c.CreatedAt)
            .Take(7)
            .ToList();

        if (recentCheckIns.Count == 0)
        {
            return new WellbeingInsightResponseDto
            {
                RiskScore = 0,
                RiskLevel = "Not enough data",
                Summary = "There are no check-ins yet. Complete your first check-in to receive a wellbeing insight.",
                Recommendations = new List<string>
                {
                    "Start by completing a daily check-in.",
                    "Track your stress and energy consistently for better insights."
                }
            };
        }

        var averageStress = recentCheckIns.Average(c => c.StressLevel);
        var averageEnergy = recentCheckIns.Average(c => c.EnergyLevel);

        var riskScore = CalculateRiskScore(averageStress, averageEnergy, recentCheckIns);
        var riskLevel = GetRiskLevel(riskScore);

        var aiInput = new WellbeingInsightAiInputDto
        {
            RiskScore = riskScore,
            RiskLevel = riskLevel,
            AverageStress = averageStress,
            AverageEnergy = averageEnergy,
            HighStressDays = recentCheckIns.Count(c => c.StressLevel >= 8),
            LowEnergyDays = recentCheckIns.Count(c => c.EnergyLevel <= 3),
            HasIncreasingStressTrend = HasIncreasingStressTrend(recentCheckIns),
            CheckInCount = recentCheckIns.Count
        };

        return await _aiTextGenerator.GenerateAsync(aiInput);
    }

    private static int CalculateRiskScore(double averageStress, double averageEnergy, List<Domain.Entities.CheckIn> checkIns)
    {
        var score = 0;

        score += (int)Math.Round(averageStress * 7);
        score += (int)Math.Round((10 - averageEnergy) * 5);

        var highStressDays = checkIns.Count(c => c.StressLevel >= 8);
        score += highStressDays * 5;

        var lowEnergyDays = checkIns.Count(c => c.EnergyLevel <= 3);
        score += lowEnergyDays * 5;

        if (HasIncreasingStressTrend(checkIns))
        {
            score += 10;
        }

        return Math.Clamp(score, 0, 100);
    }

    private static bool HasIncreasingStressTrend(List<Domain.Entities.CheckIn> checkIns)
    {
        var ordered = checkIns
            .OrderBy(c => c.CreatedAt)
            .TakeLast(3)
            .ToList();

        if (ordered.Count < 3)
        {
            return false;
        }

        return ordered[0].StressLevel < ordered[1].StressLevel &&
               ordered[1].StressLevel < ordered[2].StressLevel;
    }

    private static string GetRiskLevel(int riskScore)
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

    private static string BuildSummary(double averageStress, double averageEnergy, string riskLevel)
    {
        return riskLevel switch
        {
            "Low" => "Your recent wellbeing indicators look stable. Your stress is relatively low and your energy levels are healthy.",
            "Moderate" => "Your recent check-ins show some signs of pressure. Stress or energy levels may need attention.",
            "High" => "Your recent wellbeing pattern suggests elevated risk. Stress appears high or energy is consistently low.",
            "Critical" => "Your recent check-ins indicate a critical wellbeing risk pattern. It may be important to slow down and seek support.",
            _ => "Your wellbeing insight is based on your recent check-ins."
        };
    }

    private static List<string> BuildRecommendations(double averageStress, double averageEnergy, int riskScore)
    {
        var recommendations = new List<string>();

        if (averageStress >= 7)
        {
            recommendations.Add("Try to reduce context switching and focus on one priority task at a time.");
            recommendations.Add("Consider taking a short break between meetings or intense work sessions.");
        }

        if (averageEnergy <= 4)
        {
            recommendations.Add("Pay attention to rest, hydration, and recovery during the day.");
            recommendations.Add("Avoid overloading your schedule if your energy remains low.");
        }

        if (riskScore >= 60)
        {
            recommendations.Add("If this pattern continues, consider discussing workload or support options with your manager or HR.");
        }

        if (recommendations.Count == 0)
        {
            recommendations.Add("Keep maintaining your current routine and continue tracking your wellbeing.");
            recommendations.Add("Use daily check-ins to notice early changes in stress or energy.");
        }

        return recommendations;
    }
}
