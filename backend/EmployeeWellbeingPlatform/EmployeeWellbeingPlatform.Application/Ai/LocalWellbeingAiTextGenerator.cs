using EmployeeWellbeingPlatform.Application.Ai.Dtos;

namespace EmployeeWellbeingPlatform.Application.Ai;

public class LocalWellbeingAiTextGenerator : IWellbeingAiTextGenerator
{
    public Task<WellbeingInsightResponseDto> GenerateAsync(WellbeingInsightAiInputDto input)
    {
        var response = new WellbeingInsightResponseDto
        {
            RiskScore = input.RiskScore,
            RiskLevel = input.RiskLevel,
            Summary = BuildSummary(input),
            Recommendations = BuildRecommendations(input)
        };

        return Task.FromResult(response);
    }

    private static string BuildSummary(WellbeingInsightAiInputDto input)
    {
        return input.RiskLevel switch
        {
            "Low" => "Your recent wellbeing indicators look stable. Your stress is relatively low and your energy levels are healthy.",
            "Moderate" => "Your recent check-ins show some signs of pressure. Stress or energy levels may need attention.",
            "High" => "Your recent wellbeing pattern suggests elevated risk. Stress appears high or energy is consistently low.",
            "Critical" => "Your recent check-ins indicate a critical wellbeing risk pattern. It may be important to slow down and seek support.",
            _ => "Your wellbeing insight is based on your recent check-ins."
        };
    }

    private static List<string> BuildRecommendations(WellbeingInsightAiInputDto input)
    {
        var recommendations = new List<string>();

        if (input.AverageStress >= 7)
        {
            recommendations.Add("Try to reduce context switching and focus on one priority task at a time.");
            recommendations.Add("Consider taking a short break between meetings or intense work sessions.");
        }

        if (input.AverageEnergy <= 4)
        {
            recommendations.Add("Pay attention to rest, hydration, and recovery during the day.");
            recommendations.Add("Avoid overloading your schedule if your energy remains low.");
        }

        if (input.RiskScore >= 60)
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