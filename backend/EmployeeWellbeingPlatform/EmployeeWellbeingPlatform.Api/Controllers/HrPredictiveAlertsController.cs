using EmployeeWellbeingPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeWellbeingPlatform.Api.Controllers;

[ApiController]
[Route("api/hr/predictive-alerts")]
[Authorize(Roles = "HR")]
public class HrPredictiveAlertsController : ControllerBase
{
    private readonly IPredictiveAlertService _predictiveAlertService;

    public HrPredictiveAlertsController(IPredictiveAlertService predictiveAlertService)
    {
        _predictiveAlertService = predictiveAlertService;
    }

    [HttpGet]
    public async Task<IActionResult> GetHrPredictiveAlerts(
    [FromQuery] int days = 30,
    CancellationToken cancellationToken = default)
    {
        var alerts = await _predictiveAlertService
            .GetHrPredictiveAlertsAsync(days, cancellationToken);

        return Ok(alerts);
    }
}