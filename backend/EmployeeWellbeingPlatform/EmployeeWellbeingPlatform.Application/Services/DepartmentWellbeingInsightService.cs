using EmployeeWellbeingPlatform.Application.Ai;
using EmployeeWellbeingPlatform.Application.Ai.Dtos;
using EmployeeWellbeingPlatform.Application.Interfaces;

namespace EmployeeWellbeingPlatform.Application.Services;

public class DepartmentWellbeingInsightService
{
    private readonly IHRDashboardRepository _hrDashboardRepository;
    private readonly IDepartmentWellbeingAiTextGenerator _aiTextGenerator;

    public DepartmentWellbeingInsightService(
        IHRDashboardRepository hrDashboardRepository,
        IDepartmentWellbeingAiTextGenerator aiTextGenerator)
    {
        _hrDashboardRepository = hrDashboardRepository;
        _aiTextGenerator = aiTextGenerator;
    }

    public async Task<DepartmentWellbeingInsightResponseDto> GetInsightAsync(
        string departmentName,
        int days)
    {
        var department = await _hrDashboardRepository.GetDepartmentDrilldownAsync(
            departmentName,
            days);

        if (department.TotalCheckIns == 0)
        {
            return new DepartmentWellbeingInsightResponseDto
            {
                Department = departmentName,
                RiskLevel = "Not enough data",
                Summary = "There is not enough wellbeing data yet to generate a department insight.",
                Recommendations = new List<string>
                {
                    "Encourage regular wellbeing check-ins within this department.",
                    "Review the department dashboard again after more data is collected.",
                    "Use aggregated insights only when enough check-ins are available."
                }
            };
        }

        var input = new DepartmentWellbeingInsightAiInputDto
        {
            Department = department.Department,
            TotalCheckIns = department.TotalCheckIns,
            AverageStress = department.AverageStress,
            AverageEnergy = department.AverageEnergy,
            HighStressCount = department.HighStressCount,
            RiskScore = department.RiskScore,
            RiskLevel = department.RiskLevel,
            DailyTrend = department.DailyTrend
                .Select(item => new DepartmentTrendAiInputDto
                {
                    Date = item.Date,
                    AverageStress = item.AverageStress,
                    AverageEnergy = item.AverageEnergy,
                    CheckInsCount = item.CheckInsCount
                })
                .ToList()
        };

        return await _aiTextGenerator.GenerateAsync(input);
    }
}