namespace EmployeeWellbeingPlatform.Application.HR.Dtos;

public class DepartmentDailyTrendDto
{
    public DateTime Date { get; set; }

    public double AverageStress { get; set; }

    public double AverageEnergy { get; set; }

    public int CheckInsCount { get; set; }
}