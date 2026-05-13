using EmployeeWellbeingPlatform.Application.Ai.Dtos;
using EmployeeWellbeingPlatform.Application.Interfaces;

namespace EmployeeWellbeingPlatform.Application.Ai;

public class LocalHrWellbeingAiTextGenerator : IHrWellbeingAiTextGenerator
{
    public Task<HrWellbeingSummaryResponseDto> GenerateAsync(HrWellbeingSummaryAiInputDto input)
    {
        return Task.FromResult(new HrWellbeingSummaryResponseDto
        {
            RiskLevel = input.RiskLevel,
            HighestRiskDepartment = input.HighestRiskDepartment,
            Summary = BuildSummary(input),
            Recommendations = BuildRecommendations(input)
        });
    }

    private static string BuildSummary(HrWellbeingSummaryAiInputDto input)
    {
        return input.RiskLevel switch
        {
            "Low" => "The company-wide wellbeing indicators look stable, with manageable stress and healthy energy levels across departments.",
            "Moderate" => $"The organization shows moderate wellbeing risk. {input.HighestRiskDepartment} appears to need closer attention based on stress and energy indicators.",
            "High" => $"The organization shows elevated wellbeing risk. {input.HighestRiskDepartment} currently appears to be the highest-risk department.",
            "Critical" => $"The organization shows critical wellbeing risk patterns. {input.HighestRiskDepartment} should be reviewed as a priority.",
            _ => "The HR wellbeing summary is based on aggregated department-level data."
        };
    }

    private static List<string> BuildRecommendations(HrWellbeingSummaryAiInputDto input)
    {
        var recommendations = new List<string>
        {
            $"Review workload and capacity signals in {input.HighestRiskDepartment}.",
            "Encourage managers to promote regular breaks and sustainable planning.",
            "Monitor department-level trends over the next few check-in cycles."
        };

        if (input.AverageStress >= 6)
        {
            recommendations.Add("Consider running a short anonymous pulse survey to understand main stress drivers.");
        }

        if (input.AverageEnergy <= 4)
        {
            recommendations.Add("Consider initiatives focused on recovery, meeting load, and workload prioritization.");
        }

        return recommendations.Take(3).ToList();
    }
}