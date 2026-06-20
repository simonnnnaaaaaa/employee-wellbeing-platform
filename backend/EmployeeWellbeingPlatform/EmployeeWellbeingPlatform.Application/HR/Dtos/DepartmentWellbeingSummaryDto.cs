namespace EmployeeWellbeingPlatform.Application.HR.Dtos;

public class DepartmentWellbeingSummaryDto
{
    public string Department { get; set; } = null!;

    public int TotalCheckIns { get; set; }

    public double AverageStress { get; set; }

    public double AverageEnergy { get; set; }

    public int HighStressCount { get; set; }

    public double RiskScore { get; set; }

    public string RiskLevel { get; set; } = string.Empty;

}