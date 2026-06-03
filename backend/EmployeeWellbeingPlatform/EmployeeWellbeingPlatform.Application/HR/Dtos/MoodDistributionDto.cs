namespace EmployeeWellbeingPlatform.Application.HR.Dtos;

public class MoodDistributionDto
{
    public string Mood { get; set; } = string.Empty;

    public int Count { get; set; }

    public double Percentage { get; set; }
}