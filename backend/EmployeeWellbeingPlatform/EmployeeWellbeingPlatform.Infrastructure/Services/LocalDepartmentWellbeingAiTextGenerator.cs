using EmployeeWellbeingPlatform.Application.Ai;
using EmployeeWellbeingPlatform.Application.Ai.Dtos;

namespace EmployeeWellbeingPlatform.Infrastructure.Services;

public class LocalDepartmentWellbeingAiTextGenerator
    : IDepartmentWellbeingAiTextGenerator
{
    public Task<DepartmentWellbeingInsightResponseDto> GenerateAsync(
        DepartmentWellbeingInsightAiInputDto input)
    {
        var summary =
            $"{input.Department} shows a {input.RiskLevel.ToLower()} wellbeing risk level. " +
            $"Average stress is {input.AverageStress:F1}/10 and average energy is {input.AverageEnergy:F1}/10.";

        return Task.FromResult(
            new DepartmentWellbeingInsightResponseDto
            {
                Department = input.Department,
                RiskLevel = input.RiskLevel,
                Summary = summary,
                Recommendations = new List<string>
                {
                    "Continue monitoring wellbeing trends within the department.",
                    "Review workload balance and employee engagement levels.",
                    "Encourage regular wellbeing check-ins."
                }
            });
    }
}