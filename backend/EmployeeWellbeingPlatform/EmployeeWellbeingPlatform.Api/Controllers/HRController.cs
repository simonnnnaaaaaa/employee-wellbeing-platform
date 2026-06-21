using EmployeeWellbeingPlatform.Application.Interfaces;
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
    private readonly IHrReportPdfService _hrReportPdfService;

    public HRController(
        HRService hrService,
        IHrReportPdfService hrReportPdfService)
    {
        _hrService = hrService;
        _hrReportPdfService = hrReportPdfService;
    }


    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard([FromQuery] int days = 30)
    {
        var result = await _hrService.GetDashboardAsync(days);

        return Ok(result);
    }

    [HttpGet("export-pdf")]
    public async Task<IActionResult> ExportPdf(
    [FromQuery] int days = 30,
    [FromQuery] DateTime? startDate = null,
    [FromQuery] DateTime? endDate = null)
    {
        byte[] pdfBytes;
        string fileName;

        if (startDate.HasValue && endDate.HasValue)
        {
            pdfBytes = await _hrReportPdfService.GenerateDashboardReportAsync(
                startDate.Value,
                endDate.Value);

            fileName = $"HR-Wellbeing-Report-{startDate:yyyy-MM-dd}-to-{endDate:yyyy-MM-dd}.pdf";
        }
        else
        {
            pdfBytes = await _hrReportPdfService.GenerateDashboardReportAsync(days);

            fileName = $"HR-Wellbeing-Report-{days}-days.pdf";
        }

        return File(pdfBytes, "application/pdf", fileName);
    }

    [HttpGet("departments/{departmentName}/drilldown")]
    public async Task<IActionResult> GetDepartmentDrilldown(
    string departmentName,
    [FromQuery] int days = 30)
    {
        var result = await _hrService.GetDepartmentDrilldownAsync(
            departmentName,
            days);

        return Ok(result);
    }

    [HttpGet("departments/{departmentName}/export-pdf")]
    public async Task<IActionResult> ExportDepartmentPdf(
    string departmentName,
    [FromQuery] int days = 30)
    {
        var pdfBytes = await _hrReportPdfService.GenerateDepartmentReportAsync(
            departmentName,
            days);

        var safeDepartmentName = departmentName
            .Replace(" ", "-")
            .Replace("/", "-")
            .Replace("\\", "-");

        var fileName = $"HR-Wellbeing-Department-Report-{safeDepartmentName}-{days}-days.pdf";

        return File(pdfBytes, "application/pdf", fileName);
    }

}