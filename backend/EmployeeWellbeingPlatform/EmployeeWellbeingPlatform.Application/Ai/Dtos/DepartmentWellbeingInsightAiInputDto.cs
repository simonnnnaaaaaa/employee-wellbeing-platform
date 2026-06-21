namespace EmployeeWellbeingPlatform.Application.Ai.Dtos;

public class DepartmentWellbeingInsightAiInputDto
{
    public string Department { get; set; } = string.Empty;

    public int TotalCheckIns { get; set; }

    public double AverageStress { get; set; }

    public double AverageEnergy { get; set; }

    public int HighStressCount { get; set; }

    public double RiskScore { get; set; }

    public string RiskLevel { get; set; } = string.Empty;

    public List<DepartmentTrendAiInputDto> DailyTrend { get; set; } = new();
}