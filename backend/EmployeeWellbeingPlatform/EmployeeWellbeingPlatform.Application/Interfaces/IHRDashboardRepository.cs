using EmployeeWellbeingPlatform.Application.HR.Dtos;

namespace EmployeeWellbeingPlatform.Application.Interfaces;

public interface IHRDashboardRepository
{
    Task<HRDashboardResponseDto> GetDashboardAsync(int days);

    Task<HRDashboardResponseDto> GetDashboardAsync(DateTime startDate, DateTime endDate);

    Task<DepartmentDrilldownResponseDto> GetDepartmentDrilldownAsync(
    string departmentName,
    int days);
}