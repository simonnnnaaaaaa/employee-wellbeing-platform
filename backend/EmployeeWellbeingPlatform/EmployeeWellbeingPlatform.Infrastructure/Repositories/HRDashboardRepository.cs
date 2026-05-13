using EmployeeWellbeingPlatform.Application.HR.Dtos;
using EmployeeWellbeingPlatform.Application.Interfaces;
using EmployeeWellbeingPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EmployeeWellbeingPlatform.Infrastructure.Repositories;

public class HRDashboardRepository : IHRDashboardRepository
{
    private readonly AppDbContext _context;

    public HRDashboardRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<HRDashboardResponseDto> GetDashboardAsync()
    {
        var checkIns = await _context.CheckIns
            .Include(c => c.User)
            .ThenInclude(u => u.Department)
            .ToListAsync();

        var totalCheckIns = checkIns.Count;

        return new HRDashboardResponseDto
        {
            TotalCheckIns = totalCheckIns,
            AverageStress = totalCheckIns > 0 ? checkIns.Average(c => c.StressLevel) : 0,
            AverageEnergy = totalCheckIns > 0 ? checkIns.Average(c => c.EnergyLevel) : 0,
            HighStressCount = checkIns.Count(c => c.StressLevel >= 8),

            Departments = checkIns
                .GroupBy(c => c.User.Department != null ? c.User.Department.Name : "Unassigned")
                .Select(group => new DepartmentWellbeingSummaryDto
                {
                    Department = group.Key,
                    TotalCheckIns = group.Count(),
                    AverageStress = group.Average(c => c.StressLevel),
                    AverageEnergy = group.Average(c => c.EnergyLevel),
                    HighStressCount = group.Count(c => c.StressLevel >= 8)
                })
                .ToList()
        };
    }
}