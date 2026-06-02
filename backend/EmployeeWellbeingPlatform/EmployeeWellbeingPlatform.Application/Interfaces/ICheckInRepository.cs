using EmployeeWellbeingPlatform.Domain.Entities;

namespace EmployeeWellbeingPlatform.Application.Interfaces;

public interface ICheckInRepository
{
    Task AddAsync(CheckIn checkIn);

    Task<List<CheckIn>> GetByUserIdAsync(Guid userId);

    Task<List<CheckIn>> GetAllAsync();
}