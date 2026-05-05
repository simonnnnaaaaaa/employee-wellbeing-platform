using EmployeeWellbeingPlatform.Application.Admin.Dtos;
using EmployeeWellbeingPlatform.Application.Interfaces;
using EmployeeWellbeingPlatform.Domain.Entities;

namespace EmployeeWellbeingPlatform.Application.Services;

public class AdminService
{
    private readonly IAdminRepository _adminRepository;
    private readonly IDepartmentRepository _departmentRepository;

    private static readonly string[] AllowedRoles = ["Employee", "HR", "Admin"];

    public AdminService(
    IAdminRepository adminRepository,
    IDepartmentRepository departmentRepository)
    {
        _adminRepository = adminRepository;
        _departmentRepository = departmentRepository;
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
            DepartmentId = user.DepartmentId,
            Department = user.Department?.Name ?? "Unassigned"
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

    public async Task<bool> UpdateDepartmentAsync(Guid userId, Guid departmentId)
    {
        var user = await _adminRepository.GetByIdAsync(userId);

        if (user == null)
        {
            return false;
        }

        user.DepartmentId = departmentId;

        await _adminRepository.SaveChangesAsync();

        return true;
    }

    public async Task<List<DepartmentDto>> GetDepartmentsAsync()
    {
        var departments = await _departmentRepository.GetAllAsync();

        return departments.Select(department => new DepartmentDto
        {
            Id = department.Id,
            Name = department.Name
        }).ToList();
    }

    public async Task<bool> CreateDepartmentAsync(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return false;
        }

        var normalizedName = name.Trim();

        var exists = await _departmentRepository.ExistsByNameAsync(normalizedName);

        if (exists)
        {
            return false;
        }

        var department = new Department
        {
            Id = Guid.NewGuid(),
            Name = normalizedName
        };

        await _departmentRepository.AddAsync(department);

        return true;
    }

}