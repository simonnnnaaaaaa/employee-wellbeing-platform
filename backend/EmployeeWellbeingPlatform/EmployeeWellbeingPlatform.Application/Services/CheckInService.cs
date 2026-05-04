using EmployeeWellbeingPlatform.Application.CheckIns.Dtos;
using EmployeeWellbeingPlatform.Application.Interfaces;
using EmployeeWellbeingPlatform.Domain.Entities;

namespace EmployeeWellbeingPlatform.Application.Services;

public class CheckInService
{
    private readonly ICheckInRepository _checkInRepository;

    public CheckInService(ICheckInRepository checkInRepository)
    {
        _checkInRepository = checkInRepository;
    }

    public async Task CreateAsync(Guid userId, CreateCheckInRequestDto request)
    {
        var checkIn = new CheckIn
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            StressLevel = request.StressLevel,
            EnergyLevel = request.EnergyLevel,
            Mood = request.Mood,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        await _checkInRepository.AddAsync(checkIn);
    }

    public async Task<List<CheckInResponseDto>> GetMyCheckInsAsync(Guid userId)
    {
        var checkIns = await _checkInRepository.GetByUserIdAsync(userId);

        return checkIns.Select(checkIn => new CheckInResponseDto
        {
            Id = checkIn.Id,
            StressLevel = checkIn.StressLevel,
            EnergyLevel = checkIn.EnergyLevel,
            Mood = checkIn.Mood,
            Notes = checkIn.Notes,
            CreatedAt = checkIn.CreatedAt
        }).ToList();
    }
}


