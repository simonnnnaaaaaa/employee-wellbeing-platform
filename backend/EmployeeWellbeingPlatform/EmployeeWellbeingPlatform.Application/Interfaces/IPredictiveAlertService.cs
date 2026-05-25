using EmployeeWellbeingPlatform.Application.DTOs.AI;

namespace EmployeeWellbeingPlatform.Application.Interfaces;

public interface IPredictiveAlertService
{
    Task<List<PredictiveAlertDto>> GetEmployeePredictiveAlertsAsync(
        Guid employeeId,
        CancellationToken cancellationToken = default);
}