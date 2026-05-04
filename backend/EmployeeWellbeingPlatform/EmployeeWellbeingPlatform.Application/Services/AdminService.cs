using EmployeeWellbeingPlatform.Application.Admin.Dtos;
using EmployeeWellbeingPlatform.Application.Interfaces;

namespace EmployeeWellbeingPlatform.Application.Services;

public class AdminService
{
    private readonly IAdminRepository _adminRepository;

    private static readonly string[] AllowedRoles = ["Employee", "HR", "Admin"];

    public AdminService(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    public async Task<List<UserAdminDto>> GetAllUsersAsync()
    {
        var users = await _adminRepository.GetAllUsersAsync();

        return users.Select(user => new UserAdminDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role,
            Department = user.Department
        }).ToList();
    }

    public async Task<bool> UpdateRoleAsync(Guid userId, string role)
    {
        if (!AllowedRoles.Contains(role))
        {
            return false;
        }

        var user = await _adminRepository.GetByIdAsync(userId);

        if (user == null)
        {
            return false;
        }

        user.Role = role;

        await _adminRepository.SaveChangesAsync();

        return true;
    }

    public async Task<bool> UpdateDepartmentAsync(Guid userId, string department)
    {
        if (string.IsNullOrWhiteSpace(department))
        {
            return false;
        }

        var user = await _adminRepository.GetByIdAsync(userId);

        if (user == null)
        {
            return false;
        }

        user.Department = department.Trim();

        await _adminRepository.SaveChangesAsync();

        return true;
    }
}