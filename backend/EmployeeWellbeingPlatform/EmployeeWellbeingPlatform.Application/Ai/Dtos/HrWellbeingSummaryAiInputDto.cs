namespace EmployeeWellbeingPlatform.Application.Ai.Dtos;

public class HrWellbeingSummaryAiInputDto
{
    public int TotalCheckIns { get; set; }

    public double AverageStress { get; set; }

    public double AverageEnergy { get; set; }

    public int HighStressCount { get; set; }

    public string HighestRiskDepartment { get; set; } = null!;

    public string RiskLevel { get; set; } = null!;

    public List<HrDepartmentAiInputDto> Departments { get; set; } = new();
}

public class HrDepartmentAiInputDto
{
    public string Department { get; set; } = null!;

    public int TotalCheckIns { get; set; }

    public double AverageStress { get; set; }

    public double AverageEnergy { get; set; }

    public int HighStressCount { get; set; }

    public double HighStressPercentage { get; set; }
}