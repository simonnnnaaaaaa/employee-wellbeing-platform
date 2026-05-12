namespace EmployeeWellbeingPlatform.Application.Ai.Dtos;

public class WellbeingInsightAiInputDto
{
    public int RiskScore { get; set; }

    public string RiskLevel { get; set; } = null!;

    public double AverageStress { get; set; }

    public double AverageEnergy { get; set; }

    public int HighStressDays { get; set; }

    public int LowEnergyDays { get; set; }

    public bool HasIncreasingStressTrend { get; set; }

    public int CheckInCount { get; set; }
}