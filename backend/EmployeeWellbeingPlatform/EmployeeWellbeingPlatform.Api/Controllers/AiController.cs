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
    private readonly HrWellbeingSummaryService _hrWellbeingSummaryService;
    private readonly DepartmentWellbeingInsightService _departmentWellbeingInsightService;

    public AiController(
    WellbeingInsightService wellbeingInsightService,
    HrWellbeingSummaryService hrWellbeingSummaryService,
    DepartmentWellbeingInsightService departmentWellbeingInsightService)
    {
        _wellbeingInsightService = wellbeingInsightService;
        _hrWellbeingSummaryService = hrWellbeingSummaryService;
        _departmentWellbeingInsightService = departmentWellbeingInsightService;
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

    [HttpGet("hr-wellbeing-summary")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<IActionResult> GetHrWellbeingSummary([FromQuery] int days = 30)
    {
        var summary = await _hrWellbeingSummaryService.GetSummaryAsync(days);

        return Ok(summary);
    }

    [HttpGet("department-wellbeing-insight/{departmentName}")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<IActionResult> GetDepartmentWellbeingInsight(
    string departmentName,
    [FromQuery] int days = 30)
    {
        var insight = await _departmentWellbeingInsightService.GetInsightAsync(
            departmentName,
            days);

        return Ok(insight);
    }
}