namespace EmployeeWellbeingPlatform.Application.Interfaces;

public interface IHrReportPdfService
{
    Task<byte[]> GenerateDashboardReportAsync(int days);

    Task<byte[]> GenerateDashboardReportAsync(DateTime startDate, DateTime endDate);
}