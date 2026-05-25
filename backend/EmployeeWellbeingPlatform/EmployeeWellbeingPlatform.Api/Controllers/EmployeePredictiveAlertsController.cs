using System.Security.Claims;
using EmployeeWellbeingPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeWellbeingPlatform.Api.Controllers;

[ApiController]
[Route("api/employee/predictive-alerts")]
[Authorize(Roles = "Employee")]
public class EmployeePredictiveAlertsController : ControllerBase
{
    private readonly IPredictiveAlertService _predictiveAlertService;

    public EmployeePredictiveAlertsController(IPredictiveAlertService predictiveAlertService)
    {
        _predictiveAlertService = predictiveAlertService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyPredictiveAlerts(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var alerts = await _predictiveAlertService.GetEmployeePredictiveAlertsAsync(
            userId,
            cancellationToken);

        return Ok(alerts);
    }
}