namespace EmployeeWellbeingPlatform.Application.Ai.Dtos;

public class HrWellbeingSummaryResponseDto
{
    public string Summary { get; set; } = null!;

    public string RiskLevel { get; set; } = null!;

    public string HighestRiskDepartment { get; set; } = null!;

    public List<string> Recommendations { get; set; } = new();
}