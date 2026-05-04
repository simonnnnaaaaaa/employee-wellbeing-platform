namespace EmployeeWellbeingPlatform.Application.HR.Dtos;

public class HRDashboardResponseDto
{
    public int TotalCheckIns { get; set; }

    public double AverageStress { get; set; }

    public double AverageEnergy { get; set; }

    public int HighStressCount { get; set; }

    public List<DepartmentWellbeingSummaryDto> Departments { get; set; } = new();
}