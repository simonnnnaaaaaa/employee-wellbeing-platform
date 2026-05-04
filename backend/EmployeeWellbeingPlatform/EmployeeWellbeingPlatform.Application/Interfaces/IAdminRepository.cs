using EmployeeWellbeingPlatform.Domain.Entities;

namespace EmployeeWellbeingPlatform.Application.Interfaces;

public interface IAdminRepository
{
    Task<List<User>> GetAllUsersAsync();

    Task<User?> GetByIdAsync(Guid id);

    Task SaveChangesAsync();
}