using EmployeeWellbeingPlatform.Application.Ai.Dtos;
using EmployeeWellbeingPlatform.Application.Interfaces;

namespace EmployeeWellbeingPlatform.Application.Services;
public class HrWellbeingSummaryService
{
    private readonly IHRDashboardRepository _hrDashboardRepository;
    private readonly IHrWellbeingAiTextGenerator _aiTextGenerator;

    public HrWellbeingSummaryService(
        IHRDashboardRepository hrDashboardRepository,
        IHrWellbeingAiTextGenerator aiTextGenerator)
    {
        _hrDashboardRepository = hrDashboardRepository;
        _aiTextGenerator = aiTextGenerator;
    }

    public async Task<HrWellbeingSummaryResponseDto> GetSummaryAsync()
    {
        var dashboard = await _hrDashboardRepository.GetDashboardAsync();

        if (dashboard.TotalCheckIns == 0 || dashboard.Departments.Count == 0)
        {
            return new HrWellbeingSummaryResponseDto
            {
                RiskLevel = "Not enough data",
                HighestRiskDepartment = "N/A",
                Summary = "There is not enough wellbeing data yet to generate an organizational insight.",
                Recommendations = new List<string>
                {
                    "Encourage employees to complete regular check-ins.",
                    "Review the HR dashboard again after more data is collected.",
                    "Use aggregated insights only when enough check-ins are available."
                }
            };
        }

        var departments = dashboard.Departments
            .Select(dep => new HrDepartmentAiInputDto
            {
                Department = dep.Department,
                TotalCheckIns = dep.TotalCheckIns,
                AverageStress = dep.AverageStress,
                AverageEnergy = dep.AverageEnergy,
                HighStressCount = dep.HighStressCount,
                HighStressPercentage = dep.TotalCheckIns > 0
                    ? (double)dep.HighStressCount / dep.TotalCheckIns * 100
                    : 0
            })
            .ToList();

        var rankedDepartments = departments
    .Where(dep => dep.Department != "Unassigned")
    .ToList();

        var highestRiskDepartment = rankedDepartments.Any()
            ? rankedDepartments
                .OrderByDescending(dep => CalculateDepartmentRiskScore(dep))
                .First()
            : departments
                .OrderByDescending(dep => CalculateDepartmentRiskScore(dep))
                .First();

        var riskLevel = GetRiskLevel(
            dashboard.AverageStress,
            dashboard.AverageEnergy,
            dashboard.HighStressCount,
            dashboard.TotalCheckIns);

        var input = new HrWellbeingSummaryAiInputDto
        {
            TotalCheckIns = dashboard.TotalCheckIns,
            AverageStress = dashboard.AverageStress,
            AverageEnergy = dashboard.AverageEnergy,
            HighStressCount = dashboard.HighStressCount,
            HighestRiskDepartment = highestRiskDepartment.Department,
            RiskLevel = riskLevel,
            Departments = departments
        };

        return await _aiTextGenerator.GenerateAsync(input);
    }

    private static double CalculateDepartmentRiskScore(HrDepartmentAiInputDto department)
    {
        return department.AverageStress * 7
               + (10 - department.AverageEnergy) * 5
               + department.HighStressPercentage * 0.5;
    }

    private static string GetRiskLevel(
        double averageStress,
        double averageEnergy,
        int highStressCount,
        int totalCheckIns)
    {
        var highStressPercentage = totalCheckIns > 0
            ? (double)highStressCount / totalCheckIns * 100
            : 0;

        var score =
            averageStress * 7
            + (10 - averageEnergy) * 5
            + highStressPercentage * 0.5;

        if (score < 30)
        {
            return "Low";
        }

        if (score < 60)
        {
            return "Moderate";
        }

        if (score < 80)
        {
            return "High";
        }

        return "Critical";
    }
}
