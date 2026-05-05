using EmployeeWellbeingPlatform.Domain.Entities;

namespace EmployeeWellbeingPlatform.Application.Interfaces;

public interface IDepartmentRepository
{
    Task<List<Department>> GetAllAsync();

    Task<bool> ExistsByNameAsync(string name);

    Task AddAsync(Department department);
}