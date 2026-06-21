using EmployeeWellbeingPlatform.Application.HR.Dtos;
using EmployeeWellbeingPlatform.Application.Interfaces;

namespace EmployeeWellbeingPlatform.Application.Services;

public class HRService
{
    private readonly IHRDashboardRepository _hrDashboardRepository;

    public HRService(IHRDashboardRepository hrDashboardRepository)
    {
        _hrDashboardRepository = hrDashboardRepository;
    }

    public async Task<HRDashboardResponseDto> GetDashboardAsync(int days)
    {
        return await _hrDashboardRepository.GetDashboardAsync(days);
    }
    public async Task<HRDashboardResponseDto> GetDashboardAsync(DateTime startDate, DateTime endDate)
    {
        return await _hrDashboardRepository.GetDashboardAsync(startDate, endDate);
    }

    public async Task<DepartmentDrilldownResponseDto> GetDepartmentDrilldownAsync(
    string departmentName,
    int days)
    {
        return await _hrDashboardRepository.GetDepartmentDrilldownAsync(
            departmentName,
            days);
    }
}