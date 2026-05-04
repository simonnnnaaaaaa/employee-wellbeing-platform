namespace EmployeeWellbeingPlatform.Domain.Entities;

public class CheckIn
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public int StressLevel { get; set; }

    public int EnergyLevel { get; set; }

    public string Mood { get; set; } = null!;

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public User User { get; set; } = null!;
}