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

    public async Task<HRDashboardResponseDto> GetDashboardAsync()
    {
        return await _hrDashboardRepository.GetDashboardAsync();
    }
}