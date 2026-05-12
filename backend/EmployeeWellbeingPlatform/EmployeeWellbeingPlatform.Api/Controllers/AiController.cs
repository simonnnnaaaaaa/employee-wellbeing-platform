using EmployeeWellbeingPlatform.Application.Ai;
using EmployeeWellbeingPlatform.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EmployeeWellbeingPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AiController : ControllerBase
{
    private readonly WellbeingInsightService _wellbeingInsightService;

    public AiController(WellbeingInsightService wellbeingInsightService)
    {
        _wellbeingInsightService = wellbeingInsightService;
    }

    [HttpGet("my-wellbeing-insight")]
    public async Task<IActionResult> GetMyWellbeingInsight()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        var userId = Guid.Parse(userIdClaim);

        var insight = await _wellbeingInsightService.GetMyInsightAsync(userId);

        return Ok(insight);
    }
}