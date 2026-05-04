using EmployeeWellbeingPlatform.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeWellbeingPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "HR")]
public class HRController : ControllerBase
{
    private readonly HRService _hrService;

    public HRController(HRService hrService)
    {
        _hrService = hrService;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var result = await _hrService.GetDashboardAsync();

        return Ok(result);
    }
}