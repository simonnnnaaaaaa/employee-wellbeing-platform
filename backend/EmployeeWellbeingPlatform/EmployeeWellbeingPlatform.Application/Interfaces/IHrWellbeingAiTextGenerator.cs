using EmployeeWellbeingPlatform.Application.Ai.Dtos;


namespace EmployeeWellbeingPlatform.Application.Interfaces;
public interface IHrWellbeingAiTextGenerator
{
    Task<HrWellbeingSummaryResponseDto> GenerateAsync(HrWellbeingSummaryAiInputDto input);
}
