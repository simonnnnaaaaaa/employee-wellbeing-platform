namespace EmployeeWellbeingPlatform.Application.Ai.Dtos;

public class WellbeingInsightResponseDto
{
    public int RiskScore { get; set; }

    public string RiskLevel { get; set; } = null!;

    public string Summary { get; set; } = null!;

    public List<string> Recommendations { get; set; } = new();
}