using EmployeeWellbeingPlatform.Application.HR.Dtos;

namespace EmployeeWellbeingPlatform.Application.Interfaces;

public interface IHRDashboardRepository
{
    Task<HRDashboardResponseDto> GetDashboardAsync();
}