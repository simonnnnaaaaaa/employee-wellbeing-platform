using EmployeeWellbeingPlatform.Domain.Entities;

namespace EmployeeWellbeingPlatform.Application.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}