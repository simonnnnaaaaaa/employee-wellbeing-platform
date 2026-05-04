using EmployeeWellbeingPlatform.Application.Interfaces;
using EmployeeWellbeingPlatform.Domain.Entities;
using EmployeeWellbeingPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EmployeeWellbeingPlatform.Infrastructure.Repositories;

public class AdminRepository : IAdminRepository
{
    private readonly AppDbContext _context;

    public AdminRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<User>> GetAllUsersAsync()
    {
        return await _context.Users.ToListAsync();
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}