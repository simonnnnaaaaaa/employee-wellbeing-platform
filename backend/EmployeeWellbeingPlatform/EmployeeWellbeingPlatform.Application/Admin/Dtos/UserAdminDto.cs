namespace EmployeeWellbeingPlatform.Application.Admin.Dtos;

public class UserAdminDto
{
    public Guid Id { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Role { get; set; } = null!;

    public Guid? DepartmentId { get; set; }

    public string Department { get; set; } = null!;
}