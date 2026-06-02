using EmployeeWellbeingPlatform.Application.Interfaces;
using EmployeeWellbeingPlatform.Domain.Entities;
using EmployeeWellbeingPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EmployeeWellbeingPlatform.Infrastructure.Repositories;

public class CheckInRepository : ICheckInRepository
{
    private readonly AppDbContext _context;

    public CheckInRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(CheckIn checkIn)
    {
        await _context.CheckIns.AddAsync(checkIn);
        await _context.SaveChangesAsync();
    }

    public async Task<List<CheckIn>> GetByUserIdAsync(Guid userId)
    {
        return await _context.CheckIns
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<CheckIn>> GetAllAsync()
    {
        return await _context.CheckIns
            .Include(c => c.User)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }
}