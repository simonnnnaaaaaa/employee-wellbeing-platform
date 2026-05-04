using EmployeeWellbeingPlatform.Application.CheckIns.Dtos;
using EmployeeWellbeingPlatform.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EmployeeWellbeingPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CheckInsController : ControllerBase
{
    private readonly CheckInService _checkInService;

    public CheckInsController(CheckInService checkInService)
    {
        _checkInService = checkInService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateCheckInRequestDto request)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        var userId = Guid.Parse(userIdClaim);

        await _checkInService.CreateAsync(userId, request);

        return Ok("Check-in created successfully");
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyCheckIns()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        var userId = Guid.Parse(userIdClaim);

        var checkIns = await _checkInService.GetMyCheckInsAsync(userId);

        return Ok(checkIns);
    }
}