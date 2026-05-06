namespace EmployeeWellbeingPlatform.Application.Auth.Dtos;

public class LoginResponseDto
{
    public string Token { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Role { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;

}