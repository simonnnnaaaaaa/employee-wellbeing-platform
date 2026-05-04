namespace EmployeeWellbeingPlatform.Application.CheckIns.Dtos;

public class CheckInResponseDto
{
    public Guid Id { get; set; }

    public int StressLevel { get; set; }

    public int EnergyLevel { get; set; }

    public string Mood { get; set; } = null!;

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }
}