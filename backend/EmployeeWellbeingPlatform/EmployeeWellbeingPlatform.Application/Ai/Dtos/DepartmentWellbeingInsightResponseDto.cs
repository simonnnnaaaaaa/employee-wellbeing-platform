namespace EmployeeWellbeingPlatform.Application.Ai.Dtos;

public class DepartmentWellbeingInsightResponseDto
{
    public string Department { get; set; } = string.Empty;

    public string RiskLevel { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public List<string> Recommendations { get; set; } = new();
}