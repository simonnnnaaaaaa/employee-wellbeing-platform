namespace EmployeeWellbeingPlatform.Domain.Entities;

public class Department
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public ICollection<User> Users { get; set; } = new List<User>();
}