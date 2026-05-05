namespace EmployeeWellbeingPlatform.Domain.Entities;

public class User
{
    public Guid Id { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string Role { get; set; } = null!;

    public Guid? DepartmentId { get; set; }

    public Department? Department { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public ICollection<CheckIn> CheckIns { get; set; } = new List<CheckIn>();
}