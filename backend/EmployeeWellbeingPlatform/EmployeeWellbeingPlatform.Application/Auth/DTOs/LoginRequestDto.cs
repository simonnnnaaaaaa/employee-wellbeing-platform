namespace EmployeeWellbeingPlatform.Application.Auth.Dtos;

public class LoginRequest
{
    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;
}