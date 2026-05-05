using EmployeeWellbeingPlatform.Application.Interfaces;
using EmployeeWellbeingPlatform.Domain.Entities;
using EmployeeWellbeingPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EmployeeWellbeingPlatform.Infrastructure.Repositories;

public class DepartmentRepository : IDepartmentRepository
{
    private readonly AppDbContext _context;

    public DepartmentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Department>> GetAllAsync()
    {
        return await _context.Departments
            .OrderBy(d => d.Name)
            .ToListAsync();
    }

    public async Task<bool> ExistsByNameAsync(string name)
    {
        return await _context.Departments
            .AnyAsync(d => d.Name.ToLower() == name.ToLower());
    }

    public async Task AddAsync(Department department)
    {
        await _context.Departments.AddAsync(department);
        await _context.SaveChangesAsync();
    }
}