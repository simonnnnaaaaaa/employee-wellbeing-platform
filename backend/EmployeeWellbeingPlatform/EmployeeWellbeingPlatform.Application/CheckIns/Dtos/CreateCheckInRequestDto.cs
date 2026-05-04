namespace EmployeeWellbeingPlatform.Application.CheckIns.Dtos;

public class CreateCheckInRequestDto
{
    public int StressLevel { get; set; }

    public int EnergyLevel { get; set; }

    public string Mood { get; set; } = null!;

    public string? Notes { get; set; }
}