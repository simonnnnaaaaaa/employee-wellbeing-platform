namespace EmployeeWellbeingPlatform.Application.HR.Dtos;

public class DepartmentDrilldownResponseDto
{
    public string Department { get; set; } = string.Empty;

    public int TotalCheckIns { get; set; }

    public double AverageStress { get; set; }

    public double AverageEnergy { get; set; }

    public int HighStressCount { get; set; }

    public double RiskScore { get; set; }

    public string RiskLevel { get; set; } = string.Empty;

    public double CompanyAverageStress { get; set; }

    public double CompanyAverageEnergy { get; set; }

    public double CompanyRiskScore { get; set; }

    public double StressDifference { get; set; }

    public double EnergyDifference { get; set; }

    public double RiskDifference { get; set; }

    public List<MoodDistributionDto> MoodDistribution { get; set; } = new();

    public List<DepartmentDailyTrendDto> DailyTrend { get; set; } = new();
}