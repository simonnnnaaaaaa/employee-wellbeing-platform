namespace EmployeeWellbeingPlatform.Application.Ai.Dtos;

public class DepartmentTrendAiInputDto
{
    public DateTime Date { get; set; }

    public double AverageStress { get; set; }

    public double AverageEnergy { get; set; }

    public int CheckInsCount { get; set; }
}